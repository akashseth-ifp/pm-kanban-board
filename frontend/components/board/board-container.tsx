"use client"

import { Board } from "@backend/schema/board.schema"
import { gradientBackgrounds } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface BoardContainerProps {
  board: Board
  children: React.ReactNode
}

export const BoardContainer = ({ board, children }: BoardContainerProps) => {
  const gradient = gradientBackgrounds[board.background as keyof typeof gradientBackgrounds] || board.background || 'bg-background'
  
  return (
    <div 
      className={cn("flex h-full w-full flex-col overflow-hidden", !gradient.startsWith('bg-') && gradientBackgrounds[board.background as keyof typeof gradientBackgrounds] ? '' : gradient)}
      style={{
           background: gradientBackgrounds[board.background as keyof typeof gradientBackgrounds] ? gradientBackgrounds[board.background as keyof typeof gradientBackgrounds] : undefined
      }}
    >
      {children}
    </div>
  )
}
