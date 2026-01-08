"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { getListsAPI } from "@/clientAPI/listEventAPI"
import { List } from "@backend/schema/list.schema"
import { BoardList } from "./board-list"
import { CreateListForm } from "./create-list-form"

export const ListContainer = () => {
    const params = useParams()

    const { data: lists, isLoading } = useQuery<List[]>({
        queryKey: ["lists", params.id],
        queryFn: () => getListsAPI(params.id as string),
    })

    if (isLoading) {
        return (
             <div className="flex h-full w-full items-start gap-x-3 overflow-x-auto p-4">
                <div className="w-[272px] shrink-0 rounded-md bg-white/20 p-2 h-20 animate-pulse" />
                <div className="w-[272px] shrink-0 rounded-md bg-white/20 p-2 h-20 animate-pulse" />
             </div>
        )
    }

    return (
        <ol className="flex h-full gap-x-3 overflow-x-auto p-4 select-none">
            {lists?.map((list, index) => (
                <BoardList
                    key={list.id}
                    index={index}
                    data={list}
                />
            ))}
            <div className="w-[272px] shrink-0">
                <CreateListForm />
            </div>
            {/* Spacer for better scrolling */}
            <div className="w-1" /> 
        </ol>
    )
}
