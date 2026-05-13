'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Image } from '@tiptap/extension-image';
import { useCallback } from 'react';
import { uploadApi } from '@/lib/api';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  placeholder?: string;
}

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const res = await uploadApi.uploadImage(file);
          editor.chain().focus().setImage({ src: res.url }).run();
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Upload ảnh thất bại');
        }
      }
    };
  }, [editor]);

  return (
    <div className="tiptap-toolbar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        title="Strike"
      >
        <s>S</s>
      </button>
      <div className="divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Ordered List"
      >
        1. List
      </button>
      <div className="divider" />
      <div className="color-picker-wrapper">
        <input
          type="color"
          onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#ffffff'}
          title="Text Color"
        />
      </div>
      <button type="button" onClick={addImage} title="Add Image">
        🖼️ Image
      </button>
      <div className="divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        title="Clear Format"
      >
        ✕ Clear
      </button>
    </div>
  );
};

export default function RichTextEditor({ value, onChange, label, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep editor content in sync with value prop (important for external updates)
  if (editor && value !== editor.getHTML()) {
    // Only update if the value is significantly different to avoid cursor jumping
    // (Though for a simple form this is usually fine)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="rich-editor-wrapper">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

