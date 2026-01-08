"use client"

import { useState, useRef, ElementRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { IconDots, IconTrash, IconEdit, IconPlus } from "@tabler/icons-react"
import { useEventListener, useOnClickOutside } from "usehooks-ts"

import { List } from "@backend/schema/list.schema"
import { updateListAPI, deleteListAPI } from "@/clientAPI/listEventAPI"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useParams } from "next/navigation"

interface BoardListProps {
  data: List
  index: number
}

export const BoardList = ({ data, index }: BoardListProps) => {
    const params = useParams()
    const queryClient = useQueryClient()
    const formRef = useRef<ElementRef<"form">>(null)
    const inputRef = useRef<ElementRef<"input">>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(data.title)

    const enableEditing = () => {
        setIsEditing(true)
        setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.select()
        })
    }

    const disableEditing = () => {
        setIsEditing(false)
        setTitle(data.title) // Reset to original if cancelled
    }

    // Update List Mutation
    const { mutate: updateList } = useMutation({
        mutationFn: (newTitle: string) => updateListAPI({
            boardId: params.id as string,
            payload: { listId: data.id, title: newTitle }
        }),
        onSuccess: (newData) => {
            toast.success(`Renamed to "${newData.title}"`)
            setTitle(newData.title)
            setIsEditing(false)
            queryClient.invalidateQueries({ queryKey: ["lists", params.id] })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update list")
            setTitle(data.title) // Revert on error
        }
    })

    // Delete List Mutation
    const { mutate: deleteList } = useMutation({
        mutationFn: () => deleteListAPI({
            boardId: params.id as string,
            payload: { listId: data.id }
        }),
        onSuccess: () => {
            toast.success("List deleted")
            queryClient.invalidateQueries({ queryKey: ["lists", params.id] })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete list")
        }
    })

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            disableEditing()
        }
    }

    useEventListener("keydown", onKeyDown)
    useOnClickOutside(formRef as React.RefObject<HTMLElement>, disableEditing)

    const onSubmit = (formData: FormData) => {
        const newTitle = formData.get("title") as string
        
        if (newTitle === data.title) {
            disableEditing()
            return
        }

        if (!newTitle) {
            toast.error("List title cannot be empty")
            return
        }

        updateList(newTitle)
    }

    return (
        <li className="shrink-0 h-full w-[272px] select-none">
            <div className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2">
                {/* List Header */}
                <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start gap-x-2">
                    {isEditing ? (
                        <form 
                            ref={formRef}
                            action={onSubmit}
                            className="flex-1 px-[2px]"
                        >
                            <Input
                                ref={inputRef}
                                onBlur={disableEditing}
                                id="title"
                                name="title"
                                defaultValue={title}
                                className="h-7 truncate border-transparent bg-transparent px-[7px] py-1 text-sm font-medium focus-visible:bg-white focus-visible:border-input transition-colors" // Match look of plain text until focus
                            />
                            <button type="submit" hidden />
                        </form>
                    ) : (
                        <div 
                            onClick={enableEditing}
                            className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent cursor-pointer"
                        >
                            {data.title}
                        </div>
                    )}
                    
                    {/* List Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-auto w-auto p-2">
                                <IconDots className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="bottom">
                            <DropdownMenuItem onClick={enableEditing}>
                                <IconEdit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteList()} className="text-destructive focus:text-destructive">
                                <IconTrash className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                {/* Card List Placeholder */}
                <div className="flex flex-col mx-1 px-1 py-0.5 min-h-[20px]">
                    {/* Cards will map here */}
                </div>

                {/* Add Card Footer Placeholder */}
                 <div className="px-2 pt-2">
                    <Button
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-muted-foreground hover:text-black hover:bg-black/10 transition-colors"
                    >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add a card
                    </Button>
                </div>

            </div>
        </li>
    )
}
