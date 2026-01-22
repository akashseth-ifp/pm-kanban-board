import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { boardMember } from "../schema/board-member.schema";
import { board } from "../schema/board.schema";
import { and, eq } from "drizzle-orm";
import { AppError } from "../lib/app-error";

// Role hierarchy: Admin > Member > Viewer
const ROLE_HIERARCHY = {
  Admin: 3,
  Member: 2,
  Viewer: 1,
} as const;

type Role = keyof typeof ROLE_HIERARCHY;

/**
 * RBAC Middleware - Checks if user has minimum required role for a board
 * @param minRole - Minimum role required ('Admin', 'Member', or 'Viewer')
 * @returns Express middleware function
 *
 * Expects boardId in req.body.payload.boardId (event-based API)
 *
 * Usage:
 * - authorizeResource('Admin') - Only Admins can access
 * - authorizeResource('Member') - Admins and Members can access
 * - authorizeResource('Viewer') - All roles can access
 */
export const authorizeResource = (minRole: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get boardId from body (events) or params (normal routes)
    const boardId = req.body?.boardId || req.params.boardId;

    if (!boardId) {
      throw new AppError("Board ID is required in body or params.", 400);
    }

    const userId = req.user!.id;

    // 1. Check if board exists
    const [foundBoard] = await db
      .select()
      .from(board)
      .where(eq(board.id, boardId));

    if (!foundBoard) {
      throw new AppError("Board not found", 404);
    }

    // 2. Get user's role for this board from board_members table
    const [membership] = await db
      .select()
      .from(boardMember)
      .where(
        and(eq(boardMember.boardId, boardId), eq(boardMember.userId, userId)),
      );

    // 3. Check if user is a member of the board
    if (!membership) {
      throw new AppError(
        "Access denied. You are not a member of this board.",
        403,
      );
    }

    // 4. Check if user's role meets minimum requirement
    const userRoleLevel = ROLE_HIERARCHY[membership.role as Role];
    const requiredRoleLevel = ROLE_HIERARCHY[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      throw new AppError(
        `Access denied. ${minRole} role required, but you have ${membership.role} role.`,
        403,
      );
    }

    next();
  };
};
