"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { gradientBackgrounds } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { IconCheck } from "@tabler/icons-react"

const boardSchema = z.object({
  title: z.string().min(1, "Board Name is required"),
  background: z.string().optional(),
})

export type BoardFormValues = z.infer<typeof boardSchema>

interface BoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: BoardFormValues) => void
  isSubmitting?: boolean
  initialData?: { title: string; background?: string | null }
}

export const BoardModal = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: BoardModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: initialData?.title || "",
      background: initialData?.background || Object.keys(gradientBackgrounds)[0],
    },
  })

  // Update form when initialData changes (e.g. when opening edit modal)
  React.useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title,
        background: initialData.background || Object.keys(gradientBackgrounds)[0],
      })
    } else if (open && !initialData) {
      reset({
        title: "",
        background: Object.keys(gradientBackgrounds)[0],
      })
    }
  }, [open, initialData, reset])

  const selectedBackground = watch("background")

  const onFormSubmit = (values: BoardFormValues) => {
    onSubmit(values)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle>{initialData ? "Edit board" : "Add a new board"}</AlertDialogTitle>
          <AlertDialogDescription>
            {initialData 
              ? "Update the name or background for this board." 
              : "Enter a name and choose a background for your new board."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="board-name">Board Name</FieldLabel>
              <Input
                id="board-name"
                placeholder="e.g - Product Management"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-destructive text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel>Background</FieldLabel>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(gradientBackgrounds).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "relative aspect-square w-full rounded-md transition-all hover:scale-105",
                      selectedBackground === key && "ring-primary ring-2 ring-offset-2"
                    )}
                    style={{ background: value }}
                    onClick={() => setValue("background", key)}
                  >
                    {selectedBackground === key && (
                      <IconCheck className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </Field>
          </FieldGroup>
          <AlertDialogFooter className="sm:justify-between">
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Add Board")}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
