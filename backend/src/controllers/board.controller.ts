import { Request, Response } from "express";
import { db } from "../db";
import { board } from "../schema/board.schema";
import { boardMember } from "../schema/board-member.schema";
import { eq, desc, asc, and, gt } from "drizzle-orm";
import { list } from "../schema";
import { boardEvent } from "../schema/board-events.schema";

export const createBoardHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    res.status(201).json(newBoard);
  } catch (error) {
    req.log.error(`Create Board Error: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBoardsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const boards = await db
      .selectDistinct()
      .from(board)
      .innerJoin(boardMember, eq(board.id, boardMember.boardId))
      .where(eq(boardMember.userId, userId))
      .orderBy(desc(board.createdAt));

    res.json(boards.map((item) => item.boards));
  } catch (error) {
    req.log.error(`Get Boards Error: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBoardHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    res.json({
      board: foundBoard,
      lists: foundLists,
      tickets: [],
    });
  } catch (error) {
    req.log.error(`Get Board Error: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBoardEventsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    res.json(events);
  } catch (error) {
    req.log.error(`Get Board Events Error: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
