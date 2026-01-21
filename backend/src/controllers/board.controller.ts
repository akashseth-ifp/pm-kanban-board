import { Request, Response } from "express";
import { db } from "../db";
import { board } from "../schema/board.schema";
import { boardMember } from "../schema/board-member.schema";
import { eq, desc, asc, and, gt } from "drizzle-orm";
import { list } from "../schema";
import { boardEvent } from "../schema/board-events.schema";
import {
  generateInviteToken,
  extractEmailFromInviteToken,
} from "../utils/util";
import { sendBoardInviteMail } from "../utils/board-invite-mail";
import { AppError } from "../lib/app-error";

export const createBoardHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { title } = req.body;
    const userId = req.user!.id;

    const newBoard = await db.transaction(async (tx) => {
      // 1. Create board using the transaction client 'tx'
      const [newBoard] = await tx
        .insert(board)
        .values({
          title,
          userId,
        })
        .returning();

      // 2. Add user to board members using the same 'tx'
      await tx.insert(boardMember).values({
        boardId: newBoard.id,
        userId,
        role: "Admin",
      });

      return newBoard;
    });

    return res.status(201).json(newBoard);
  } catch (error) {
    req.log.error(`Create Board Error: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBoardsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user!.id;

    // get list of all board where user is Active member, I only want list of boards not board_member row
    const boards = await db
      .select({ board })
      .from(boardMember)
      .innerJoin(board, eq(boardMember.boardId, board.id))
      .where(
        and(eq(boardMember.userId, userId), eq(boardMember.status, "Active"))
      )
      .orderBy(desc(board.updatedAt));

    return res.json(boards.map((data) => data.board));
  } catch (error) {
    req.log.error(`Get Boards Error: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBoardHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { boardId } = req.params;
    const [foundBoard] = await db
      .select()
      .from(board)
      .where(eq(board.id, boardId));

    if (!foundBoard) {
      throw new Error("Board not found");
    }

    // fectch all the list for the board sorted by position
    const foundLists = await db
      .select()
      .from(list)
      .where(eq(list.boardId, boardId))
      .orderBy(asc(list.position));

    return res.json({
      board: foundBoard,
      lists: foundLists,
      tickets: [],
    });
  } catch (error) {
    req.log.error(`Get Board Error: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBoardEventsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { boardId } = req.params;

    const fromVersion = Number(req.query.from_version) || 0;

    const events = await db
      .select()
      .from(boardEvent)
      .where(
        and(
          eq(boardEvent.boardId, boardId as string),
          gt(boardEvent.version, Number(fromVersion))
        )
      )
      .orderBy(asc(boardEvent.version));

    return res.json(events);
  } catch (error) {
    req.log.error(`Get Board Events Error: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const inviteUserHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { boardId } = req.params;
  const { id: invitedBy } = req.user!;
  const { email, role } = req.body;

  // 1. Check if board exists
  const [foundBoard] = await db
    .select()
    .from(board)
    .where(eq(board.id, boardId));

  if (!foundBoard) {
    // We throw a specific AppError instead of a generic Error
    throw new AppError("Board not found", 404);
  }

  const inviteToken = generateInviteToken({ email, boardId });

  // 2. Database Insert
  // No try-catch here! The global handler will see code '23505'
  // and turn it into a 409 Conflict automatically.
  await db.insert(boardMember).values({
    boardId,
    role,
    status: "Pending",
    email,
    invitedBy,
    inviteToken,
  });

  // 3. Send Email
  req.log.info(`[Invite] Sending email to ${email}`);
  await sendBoardInviteMail({
    email,
    inviteToken,
    title: foundBoard.title,
  });

  return res.status(201).json({ message: "User invited successfully" });
};
export const acceptInviteHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { inviteToken } = req.body;

    // extract email from inviteToken
    const result = extractEmailFromInviteToken(inviteToken);

    if (!result) {
      throw new Error("Invalid invite token");
    }

    const { email, boardId } = result;

    // verify logged In user email with email from inviteToken
    const { email: loggedInEmail } = req.user!;

    if (email !== loggedInEmail) {
      throw new Error(`Email mismatch. Login with email ${email}`);
    }

    const [foundBoardMember] = await db
      .select()
      .from(boardMember)
      .where(
        and(
          eq(boardMember.email, email),
          eq(boardMember.boardId, boardId),
          eq(boardMember.status, "Pending")
        )
      );

    if (!foundBoardMember) {
      throw new Error("Invite not found.");
    }

    await db
      .update(boardMember)
      .set({
        status: "Active",
        userId: req.user!.id,
      })
      .where(
        and(
          eq(boardMember.email, email),
          eq(boardMember.boardId, boardId),
          eq(boardMember.status, "Pending")
        )
      );

    return res.status(200).json({
      message: "User invited successfully",
      boardId,
    });
  } catch (error) {
    req.log.error(`Accept Invite Error: ${error}`);
    if (error && error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
