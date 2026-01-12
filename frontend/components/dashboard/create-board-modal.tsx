"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const boardSchema = z.object({
  title: z.string().min(1, "Board Name is required"),
});

export type BoardFormValues = z.infer<typeof boardSchema>;

interface BoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BoardFormValues) => void;
  isSubmitting?: boolean;
  initialData?: { title: string };
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
    reset,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: initialData?.title || "",
    },
  });

  // Update form when initialData changes (e.g. when opening edit modal)
  React.useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title,
      });
    } else if (open && !initialData) {
      reset({
        title: "",
      });
    }
  }, [open, initialData, reset]);

  const onFormSubmit = (values: BoardFormValues) => {
    onSubmit(values);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle>
            {initialData ? "Edit board" : "Add a new board"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {initialData
              ? "Update the name for this board."
              : "Enter a name for your new board."}
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
          </FieldGroup>
          <AlertDialogFooter className="sm:justify-between">
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                ? "Save Changes"
                : "Add Board"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
