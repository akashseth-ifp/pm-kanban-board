import { Board, List, Ticket, Comment, CommentWithUser } from "@backend/schema";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type BoardDataState = {
  boardId: string | null;
  boardVersion: number;
  boardServerVersion: number;
  boardData: Board | null;
  listsById: Record<string, List>;
  ticketsById: Record<string, Ticket>;
  commentsByTicketId: Record<string, CommentWithUser[]>;
};

type BoardDataActions = {
  reset(): void;
  setVersion(version: number): void;
  setServerVersion(version: number): void;
  increaseVersion(): void;
  decreaseVersion(): void;
  setBoard(payload: { board: Board; lists: List[]; tickets: Ticket[] }): void;

  /* Lists */
  addList(list: List): void;
  updateList(listId: string, patch: Partial<List>): void;
  deleteList(listId: string): void;

  /* Cards */
  addTicket(ticket: Ticket): void;
  updateTicket(ticketId: string, patch: Partial<Ticket>): void;
  deleteTicket(ticketId: string): void;

  /* Comments */
  setTicketComments(ticketId: string, comments: CommentWithUser[]): void;
  addComment(comment: CommentWithUser): void;
  updateComment(
    commentId: string,
    ticketId: string,
    patch: Partial<CommentWithUser>,
  ): void;
  deleteComment(commentId: string, ticketId: string): void;

  /* Board */
  updateBoard(patch: Partial<Board>): void;
};

const useBoardDataStore = create<BoardDataState & BoardDataActions>()(
  devtools(
    (set) => ({
      boardId: null,
      boardVersion: 0,
      boardServerVersion: 0,
      boardData: null,
      listsById: {},
      ticketsById: {},
      commentsByTicketId: {},
      reset: () =>
        set({
          boardId: null,
          boardVersion: 0,
          boardServerVersion: 0,
          boardData: null,
          listsById: {},
          ticketsById: {},
          commentsByTicketId: {},
        }),

      setVersion: (version: number) =>
        set({
          boardVersion: version,
        }),

      increaseVersion: () =>
        set((s) => ({
          boardVersion: s.boardVersion + 1,
        })),

      decreaseVersion: () =>
        set((s) => ({
          boardVersion: s.boardVersion - 1,
        })),

      setServerVersion: (version: number) =>
        set({
          boardServerVersion: version,
        }),

      setBoard: ({ board, lists, tickets }) =>
        set({
          boardId: board.id,
          boardVersion: board.version,
          boardServerVersion: board.version,
          boardData: board,
          listsById: Object.fromEntries(lists.map((l) => [l.id, l])),
          ticketsById: Object.fromEntries(tickets.map((c) => [c.id, c])),
          commentsByTicketId: {},
        }),

      addList: (list) =>
        set((s) => {
          if (s.listsById[list.id]) return s;
          return {
            listsById: { ...s.listsById, [list.id]: list },
          };
        }),

      updateList: (id, patch) =>
        set((s) => ({
          listsById: {
            ...s.listsById,
            [id]: { ...s.listsById[id], ...patch },
          },
        })),

      deleteList: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.listsById;
          return { listsById: rest };
        }),

      addTicket: (ticket) =>
        set((s) => {
          if (s.ticketsById[ticket.id]) return s;
          return {
            ticketsById: { ...s.ticketsById, [ticket.id]: ticket },
          };
        }),

      updateTicket: (id, patch) =>
        set((s) => ({
          ticketsById: {
            ...s.ticketsById,
            [id]: { ...s.ticketsById[id], ...patch },
          },
        })),

      deleteTicket: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.ticketsById;
          return { ticketsById: rest };
        }),

      setTicketComments: (ticketId, comments) =>
        set((s) => ({
          commentsByTicketId: { ...s.commentsByTicketId, [ticketId]: comments },
        })),

      addComment: (comment) =>
        set((s) => {
          const ticketComments = s.commentsByTicketId[comment.ticketId];
          if (!ticketComments) return s;
          if (ticketComments.find((c) => c.id === comment.id)) return s;
          return {
            commentsByTicketId: {
              ...s.commentsByTicketId,
              [comment.ticketId]: [...ticketComments, comment],
            },
          };
        }),

      updateComment: (id, ticketId, patch) =>
        set((s) => {
          const ticketComments = s.commentsByTicketId[ticketId];
          if (!ticketComments) return s;
          return {
            commentsByTicketId: {
              ...s.commentsByTicketId,
              [ticketId]: ticketComments.map((c) =>
                c.id === id ? { ...c, ...patch } : c,
              ),
            },
          };
        }),

      deleteComment: (id, ticketId) =>
        set((s) => {
          const ticketComments = s.commentsByTicketId[ticketId];
          if (!ticketComments) return s;
          return {
            commentsByTicketId: {
              ...s.commentsByTicketId,
              [ticketId]: ticketComments.filter((c) => c.id !== id),
            },
          };
        }),

      updateBoard: (patch) =>
        set((s) => ({
          boardData: s.boardData ? { ...s.boardData, ...patch } : null,
        })),
    }),
    {
      enabled: process.env.NODE_ENV === "development",
      name: "BoardDataStore",
    },
  ),
);

export default useBoardDataStore;
