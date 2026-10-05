"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useRef, useCallback } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Code, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Unlink,
  Undo, Redo, Loader2,
} from "lucide-react";
import { useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  folder?: string;
  minHeight?: string;
}

const inputCls = "flex h-9 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors";

function ToolbarBtn({
  active,
  onClick,
  disabled,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-[hsl(var(--adm-foreground))] transition-colors disabled:opacity-40 ${
        active
          ? "bg-[hsl(var(--adm-brand))] text-[hsl(var(--adm-brand-foreground))]"
          : "hover:bg-[hsl(var(--adm-accent))]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-[hsl(var(--adm-border))]" />;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your content here…",
  folder = "blog",
  minHeight = "320px",
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      Typography,
      Placeholder.configure({ placeholder }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "rte-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rte-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rte-body focus:outline-none",
        style: `min-height: ${minHeight}; padding: 1rem 1.25rem;`,
      },
    },
    immediatelyRender: false,
  });

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5 MB");
        return;
      }
      setImageUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.success) {
          editor.chain().focus().setImage({ src: json.data.path }).run();
        } else {
          alert(json.error ?? "Image upload failed");
        }
      } finally {
        setImageUploading(false);
      }
    },
    [editor, folder]
  );

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkModal(false);
    setLinkUrl("");
  };

  if (!editor) return null;

  return (
    <div className="rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-muted)/0.3)] px-2 py-1.5">

        {/* History */}
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Inline formatting */}
        <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Divider line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn
          title="Insert link"
          active={editor.isActive("link")}
          onClick={() => {
            const existing = editor.getAttributes("link").href as string ?? "";
            setLinkUrl(existing);
            setLinkModal(true);
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        {editor.isActive("link") && (
          <ToolbarBtn title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="h-3.5 w-3.5" />
          </ToolbarBtn>
        )}

        <Divider />

        {/* Image */}
        <ToolbarBtn
          title="Insert image"
          onClick={() => imageInputRef.current?.click()}
          disabled={imageUploading}
        >
          {imageUploading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <ImageIcon className="h-3.5 w-3.5" />
          }
        </ToolbarBtn>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* ── Link modal ───────────────────────────────────────────────────── */}
      {linkModal && (
        <div className="border-b border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-accent)/0.2)] px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkModal(false); }}
              placeholder="https://example.com"
              className={`${inputCls} flex-1`}
            />
            <button type="button" onClick={applyLink}
              className="h-9 rounded-[8px] px-3 text-sm font-semibold text-[hsl(var(--adm-brand-foreground))] transition-colors"
              style={{ background: "hsl(var(--adm-brand))" }}>
              Apply
            </button>
            <button type="button" onClick={() => setLinkModal(false)}
              className="h-9 rounded-[8px] px-3 text-sm text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Editor area ──────────────────────────────────────────────────── */}
      <div className="rte-wrapper" onClick={() => editor.commands.focus()}>
        {/* Bubble menu — appears on text selection */}
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] px-1.5 py-1"
        >
          <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-3 w-3" />
          </ToolbarBtn>
          <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-3 w-3" />
          </ToolbarBtn>
          <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-3 w-3" />
          </ToolbarBtn>
          <ToolbarBtn title="Link" active={editor.isActive("link")} onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkModal(true); }}>
            <LinkIcon className="h-3 w-3" />
          </ToolbarBtn>
        </BubbleMenu>

        <EditorContent editor={editor} />
      </div>

      {/* ── Editor styles ─────────────────────────────────────────────────── */}
      <style>{`
        .rte-body h1 { font-family: var(--font-public-sans), "Public Sans", sans-serif; font-size: 1.75rem; font-weight: 700; line-height: 1.3; margin: 1.2rem 0 0.6rem; color: hsl(var(--adm-foreground)); }
        .rte-body h2 { font-family: var(--font-public-sans), "Public Sans", sans-serif; font-size: 1.35rem; font-weight: 600; line-height: 1.35; margin: 1rem 0 0.5rem; color: hsl(var(--adm-foreground)); }
        .rte-body h3 { font-size: 1.1rem; font-weight: 600; margin: 0.8rem 0 0.4rem; color: hsl(var(--adm-foreground)); }
        .rte-body p  { margin: 0.5rem 0; line-height: 1.75; color: hsl(var(--adm-foreground)); font-size: 0.9rem; }
        .rte-body ul, .rte-body ol { padding-left: 1.4rem; margin: 0.5rem 0; }
        .rte-body li { margin: 0.2rem 0; line-height: 1.7; font-size: 0.9rem; color: hsl(var(--adm-foreground)); }
        .rte-body ul li { list-style-type: disc; }
        .rte-body ol li { list-style-type: decimal; }
        .rte-body blockquote { border-left: 3px solid hsl(var(--adm-primary)); padding-left: 1rem; margin: 0.8rem 0; color: hsl(var(--adm-muted-foreground)); font-style: italic; }
        .rte-body code { background: hsl(var(--adm-muted)); padding: 0.15rem 0.35rem; border-radius: 8px; font-size: 0.82em; font-family: var(--font-public-sans), "Public Sans", sans-serif; }
        .rte-body pre  { background: hsl(var(--adm-muted)); padding: 0.8rem 1rem; border-radius: 8px; overflow-x: auto; margin: 0.8rem 0; }
        .rte-body pre code { background: transparent; padding: 0; }
        .rte-body hr   { border: none; border-top: 1px solid hsl(var(--adm-border)); margin: 1.2rem 0; }
        .rte-body a.rte-link { color: hsl(var(--adm-primary)); text-decoration: underline; cursor: pointer; }
        .rte-body img.rte-image { max-width: 100%; border-radius: 8px; margin: 0.8rem 0; display: block; }
        .rte-body .ProseMirror-selectednode { outline: 2px solid hsl(var(--adm-primary)); border-radius: 8px; }
        .rte-body p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: hsl(var(--adm-muted-foreground));
          pointer-events: none;
          float: left;
          height: 0;
        }
        .rte-wrapper { cursor: text; }
      `}</style>
    </div>
  );
}
