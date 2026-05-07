"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded transition disabled:opacity-40",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Digite o conteúdo…" }),
    ],
    content: value,
    immediatelyRender: false, // SSR-safe (Next.js)
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[140px] p-3 text-foreground",
      },
    },
  });

  // Quando o `value` da prop muda externamente (ex.: reset após save), sincroniza
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!mounted || !editor) {
    // SSR placeholder — evita flash de conteúdo cru
    return (
      <div
        className={cn(
          "rounded-md border border-input bg-background min-h-[180px] p-3 text-sm text-muted-foreground",
          className,
        )}
      >
        {placeholder ?? "Carregando editor…"}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-2 py-1">
        <ToolbarButton
          label="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Subtítulo"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <span aria-hidden className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Lista"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Citação"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <span aria-hidden className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const prev = editor.getAttributes("link").href ?? "";
            const url = window.prompt("URL do link (deixe vazio pra remover):", prev);
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
            } else {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }
          }}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <span aria-hidden className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Desfazer"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Refazer"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
