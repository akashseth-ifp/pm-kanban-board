import { Board, List, Ticket } from "@backend/schema";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type BoardDataState = {
  boardId: string | null;
  boardVersion: number;
  boardData: Board | null;
  listsById: Record<string, List>;
  ticketsById: Record<string, Ticket>;
};

type BoardDataActions = {
  reset(): void;
  setVersion(version: number): void;
  setBoard(payload: { board: Board; lists: List[]; tickets: Ticket[] }): void;

  /* Lists */
  addList(list: List): void;
  updateList(listId: string, patch: Partial<List>): void;
  deleteList(listId: string): void;

  /* Cards */
  addCard(card: Ticket): void;
  updateCard(cardId: string, patch: Partial<Ticket>): void;
  deleteCard(cardId: string): void;
};

const useBoardDataStore = create<BoardDataState & BoardDataActions>()(
  devtools(
    (set) => ({
      boardId: null,
      boardVersion: 0,
      boardData: null,
      listsById: {},
      ticketsById: {},
      reset: () =>
        set({
          boardId: null,
          boardVersion: 0,
          boardData: null,
          listsById: {},
          ticketsById: {},
        }),

      setVersion: (version) =>
        set({
          boardVersion: version,
        }),

      setBoard: ({ board, lists, tickets }) =>
        set({
          boardId: board.id,
          boardVersion: board.version,
          boardData: board,
          listsById: Object.fromEntries(lists.map((l) => [l.id, l])),
          ticketsById: Object.fromEntries(tickets.map((c) => [c.id, c])),
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

      addCard: (card) =>
        set((s) => {
          if (s.ticketsById[card.id]) return s;
          return {
            ticketsById: { ...s.ticketsById, [card.id]: card },
          };
        }),

      updateCard: (id, patch) =>
        set((s) => ({
          ticketsById: {
            ...s.ticketsById,
            [id]: { ...s.ticketsById[id], ...patch },
          },
        })),

      deleteCard: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.ticketsById;
          return { ticketsById: rest };
        }),
    }),
    {
      enabled: process.env.NODE_ENV === "development",
      name: "BoardDataStore",
    }
  )
);

export default useBoardDataStore;
