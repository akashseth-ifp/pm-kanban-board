import { List, Ticket } from "@backend/schema";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type BaseValue = {
  id: string;
  position: number;
};

type BoardOrderState = {
  listOrder: BaseValue[]; // list IDs ordered
  ticketOrderByList: Record<string, BaseValue[]>; // listId → ordered cards
};

type BoardOrderActions = {
  reset(): void;

  setBoardOrder(payload: { lists: List[]; tickets: Ticket[] }): void;

  /* Lists */
  addList(data: BaseValue): void; // Add list to the listOrder
  updateListPosition(
    listId: string,
    fromIndex: number,
    toIndex: number,
    newPosition: number
  ): void; // Update list in the listOrder
  deleteList(listId: string): void; // Delete list from the listOrder

  /* Cards */
  addTicket(ticket: BaseValue, listId: string): void; // Add card to the cardOrderByList
  updateTicketPosition(
    ticketId: string,
    fromListId: string,
    toListId: string,
    fromIndex: number,
    toIndex: number,
    newPosition: number
  ): void; // Update card in the cardOrderByList
  deleteTicket(ticketId: string, listId: string): void;
};

const useBoardOrderStore = create<BoardOrderState & BoardOrderActions>()(
  devtools(
    (set) => ({
      listOrder: [],
      ticketOrderByList: {},
      reset: () =>
        set({
          listOrder: [],
          ticketOrderByList: {},
        }),
      setBoardOrder: ({ lists, tickets }) =>
        set({
          listOrder: lists.map((l) => ({ id: l.id, position: l.position })),
          ticketOrderByList: Object.fromEntries(
            lists.map((l) => [
              l.id,
              tickets
                .filter((c) => c.listId === l.id)
                .map((c) => ({ id: c.id, position: c.position })),
            ])
          ),
        }),

      addList: (data) =>
        set((s) => {
          if (s.listOrder.some((l) => l.id === data.id)) return s;
          return {
            listOrder: [
              ...s.listOrder,
              { id: data.id, position: data.position },
            ],
            ticketOrderByList: {
              ...s.ticketOrderByList,
              [data.id]: [],
            },
          };
        }),

      // update the position of the list in the listOrder
      updateListPosition: (listId, fromIndex, toIndex, newPosition) =>
        set((s) => {
          const newListOrder = [...s.listOrder];
          newListOrder.splice(fromIndex, 1);
          newListOrder.splice(toIndex, 0, {
            id: listId,
            position: newPosition,
          });
          return {
            listOrder: newListOrder,
          };
        }),

      deleteList: (listId) =>
        set((s) => {
          const { [listId]: _, ...rest } = s.ticketOrderByList;
          return {
            listOrder: s.listOrder.filter((l) => l.id !== listId),
            ticketOrderByList: rest,
          };
        }),

      addTicket: (ticket, listId: string) =>
        set((s) => {
          const listTickets = s.ticketOrderByList[listId] || [];
          if (listTickets.some((t) => t.id === ticket.id)) return s;
          return {
            ticketOrderByList: {
              ...s.ticketOrderByList,
              [listId]: [
                ...listTickets,
                { id: ticket.id, position: ticket.position },
              ],
            },
          };
        }),

      updateTicketPosition: (
        ticketId,
        fromListId,
        toListId,
        fromIndex,
        toIndex,
        newPosition
      ) =>
        set((s) => {
          const newTicketOrderByList = { ...s.ticketOrderByList };
          const fromListTickets = [...(newTicketOrderByList[fromListId] || [])];
          const toListTickets =
            fromListId === toListId
              ? fromListTickets
              : [...(newTicketOrderByList[toListId] || [])];

          fromListTickets.splice(fromIndex, 1);
          toListTickets.splice(toIndex, 0, {
            id: ticketId,
            position: newPosition,
          });

          if (fromListId !== toListId) {
            newTicketOrderByList[fromListId] = fromListTickets;
            newTicketOrderByList[toListId] = toListTickets;
          } else {
            newTicketOrderByList[fromListId] = fromListTickets;
          }

          return {
            ticketOrderByList: newTicketOrderByList,
          };
        }),

      deleteTicket: (ticketId, listId) =>
        set((s) => {
          const listTickets = s.ticketOrderByList[listId] || [];
          return {
            ticketOrderByList: {
              ...s.ticketOrderByList,
              [listId]: listTickets.filter((t) => t.id !== ticketId),
            },
          };
        }),
    }),
    {
      enabled: process.env.NODE_ENV === "development",
      name: "BoardOrderStore",
    }
  )
);

export default useBoardOrderStore;
