"use client"


import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

interface BoardHeaderProps {
  title: string
  boardId: string
}

export const BoardHeader = ({ title, boardId }: BoardHeaderProps) => {
  return (
    <div className="flex h-14 items-center gap-4 bg-black/40 px-6 text-white backdrop-blur-sm">
      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white">
        <Link href="/app/dashboard">
          <IconArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="ml-auto">
        <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-transparent">
            Members
        </Button>
      </div>
    </div>
  )
}
