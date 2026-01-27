"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconH1,
  IconH2,
  IconQuote,
  IconCode,
  IconEraser,
  IconBraces,
} from "@tabler/icons-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

const EditorToolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/20 p-1">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
        title="Bold (Ctrl+B)"
        type="button"
      >
        <IconBold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle italic"
        title="Italic (Ctrl+I)"
        type="button"
      >
        <IconItalic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Toggle underline"
        title="Underline (Ctrl+U)"
        type="button"
      >
        <IconUnderline className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
        title="Strikethrough"
        type="button"
      >
        <IconStrikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Toggle inline code"
        title="Inline Code"
        type="button"
      >
        <IconCode className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        aria-label="Toggle heading 1"
        title="Heading 1"
        type="button"
      >
        <IconH1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        aria-label="Toggle heading 2"
        title="Heading 2"
        type="button"
      >
        <IconH2 className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Toggle bullet list"
        title="Bullet List"
        type="button"
      >
        <IconList className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Toggle ordered list"
        title="Ordered List"
        type="button"
      >
        <IconListNumbers className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Toggle blockquote"
        title="Blockquote"
        type="button"
      >
        <IconQuote className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Toggle code block"
        title="Code Block"
        type="button"
      >
        <IconBraces className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="h-8 w-8 p-0"
        title="Clear Format"
        type="button"
      >
        <IconEraser className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const TiptapEditor = ({
  content,
  onChange,
  placeholder = "Add description...",
  editable = true,
  className,
}: TiptapEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // We use this state to force re-render when the editor state changes (transactions)
  // so that the toolbar buttons update their active state.
  const [_, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        codeBlock: {
          HTMLAttributes: {
            class: "not-prose",
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-muted-foreground/30 before:pointer-events-none",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If the editor is empty (only has empty paragraphs), notify empty string
      if (editor.isEmpty) {
        onChange("");
      } else {
        onChange(html);
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onTransaction: () => {
      forceUpdate((x) => x + 1);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none w-full outline-none p-3 min-h-[150px] tiptap-editor",
        ),
      },
    },
    immediatelyRender: false,
  });

  // Sync content updates from parent
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Check if it's an empty reset
      if (editor.getText() === "" && (content === "" || content === "<p></p>"))
        return;

      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border border-input bg-background/50 ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
};
