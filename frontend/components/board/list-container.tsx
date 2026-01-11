"use client";
import useBoardOrderStore from "@/store/boardOrder.store";
import { BoardList } from "./board-list";
import { CreateListForm } from "./create-list-form";

export const ListContainer = () => {
  const listOrder = useBoardOrderStore((state) => state.listOrder);

  // if (!list) {
  //   return (
  //     <div className="flex h-full w-full items-start gap-x-3 overflow-x-auto p-4">
  //       <div className="w-[272px] shrink-0 rounded-md bg-white/20 p-2 h-20 animate-pulse" />
  //       <div className="w-[272px] shrink-0 rounded-md bg-white/20 p-2 h-20 animate-pulse" />
  //     </div>
  //   );
  // }

  return (
    <ol className="flex h-full gap-x-3 overflow-x-auto p-4 select-none">
      {listOrder.map(({ id }, index) => (
        <BoardList key={id} index={index} listId={id} />
      ))}
      <div className="w-[272px] shrink-0">
        <CreateListForm />
      </div>
      {/* Spacer for better scrolling */}
      <div className="w-1" />
    </ol>
  );
};
