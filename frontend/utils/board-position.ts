import useBoardOrderStore from "@/store/boardOrder.store";

const BASE_POSITION = 2 ** 16;

export const getAddListPosition = () => {
  const listLength = useBoardOrderStore.getState().listOrder.length;
  return listLength * BASE_POSITION + BASE_POSITION - 1;
};
