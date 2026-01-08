"use client"

import { useQuery } from "@tanstack/react-query"
import { getBoardAPI } from "@/clientAPI/boardEventAPI"
import { BoardContainer } from "@/components/board/board-container"
import { BoardHeader } from "@/components/board/board-header"
import { ListContainer } from "@/components/board/list-container"
import { useParams } from "next/navigation"

export default function BoardPage() {
    const params = useParams()
    const boardId = params.id as string

    const { data: board, isLoading, error } = useQuery({
        queryKey: ["board", boardId],
        queryFn: () => getBoardAPI({ boardId }),
        enabled: !!boardId
    })

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-muted">
                <div className="text-xl font-medium animate-pulse text-muted-foreground">Loading board...</div>
            </div>
        )
    }

    if (error || !board) {
         return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted">
                <h2 className="text-xl font-bold text-destructive">Error loading board</h2>
                <p className="text-muted-foreground">
                    {(error as Error)?.message || "Board not found or access denied"}
                </p>
                <a href="/app/dashboard" className="text-primary hover:underline">
                    Return to Dashboard
                </a>
            </div>
        )
    }

    return (
        <BoardContainer board={board}>
            <BoardHeader title={board.title} boardId={board.id} />
            <div className="h-full overflow-x-auto">
                <ListContainer />
            </div>
        </BoardContainer>
    )
}
