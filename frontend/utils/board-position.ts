import useBoardOrderStore from "@/store/boardOrder.store";

const BASE_POSITION = 2 ** 16;

export const getAddListPosition = () => {
  const listLength = useBoardOrderStore.getState().listOrder.length;
  return listLength * BASE_POSITION + BASE_POSITION - 1;
};

export const getAddTicketPosition = (listId: string) => {
  const ticketLength =
    useBoardOrderStore.getState().ticketOrderByList[listId]?.length || 0;
  return ticketLength * BASE_POSITION + BASE_POSITION - 1;
};

/**
 * Calculate new position for a list being dropped at a specific index
 * Position is calculated as the midpoint between the previous and next list
 */
export const getDNDListPosition = (destinationIndex: number): number => {
  const listOrder = useBoardOrderStore.getState().listOrder;
  // If dropping at the beginning
  if (destinationIndex === 0) {
    if (listOrder.length === 0) return BASE_POSITION;
    return listOrder[0].position / 2;
  }

  // If dropping at the end
  if (destinationIndex >= listOrder.length) {
    const lastPosition = listOrder[listOrder.length - 1]?.position || 0;
    return lastPosition + BASE_POSITION;
  }

  // Dropping in the middle - calculate midpoint
  const prevPosition = listOrder[destinationIndex - 1].position;
  const nextPosition = listOrder[destinationIndex].position;
  return (prevPosition + nextPosition) / 2;
};

/**
 * Calculate new position for a ticket being dropped at a specific index in a list
 * Position is calculated as the midpoint between the previous and next ticket
 */
export const getDNDTicketPosition = (
  ticketOrder: { id: string; position: number }[],
  destinationIndex: number
): number => {
  // If dropping at the beginning
  if (destinationIndex === 0) {
    if (ticketOrder.length === 0) return BASE_POSITION;
    return ticketOrder[0].position / 2;
  }

  // If dropping at the end
  if (destinationIndex >= ticketOrder.length) {
    const lastPosition = ticketOrder[ticketOrder.length - 1]?.position || 0;
    return lastPosition + BASE_POSITION;
  }

  // Dropping in the middle - calculate midpoint
  const prevPosition = ticketOrder[destinationIndex - 1].position;
  const nextPosition = ticketOrder[destinationIndex].position;
  return (prevPosition + nextPosition) / 2;
};

export const getListIndex = (listId: string): number => {
  const listOrder = useBoardOrderStore.getState().listOrder;
  return listOrder.findIndex((list) => list.id === listId);
};

export const getTicketIndex = (listId: string, ticketId: string): number => {
  const ticketOrder = useBoardOrderStore.getState().ticketOrderByList[listId];
  return ticketOrder.findIndex((ticket) => ticket.id === ticketId);
};
