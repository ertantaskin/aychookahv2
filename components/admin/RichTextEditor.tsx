"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Code2,
  Eye,
  FileCode,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
  X,
  Move,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Görsel resize için özel Image extension
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
        parseHTML: (element) => element.getAttribute("width") || element.style.width?.replace("px", ""),
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
            style: `height: ${attributes.height}px`,
          };
        },
        parseHTML: (element) => element.getAttribute("height") || element.style.height?.replace("px", ""),
      },
      align: {
        default: "left",
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === "left") {
            return {};
          }
          // Parent wrapper'a hizalama uygula
          return {
            "data-align": attributes.align,
          };
        },
        parseHTML: (element) => {
          const align = element.getAttribute("data-align") || 
                       (element.parentElement as HTMLElement)?.style?.textAlign ||
                       element.getAttribute("align");
          return align || "left";
        },
      },
    };
  },
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const container = document.createElement("div");
      container.className = "image-resize-container";
      
      const img = document.createElement("img");
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        img.setAttribute(key, value);
      });
      
      if (node.attrs.src) {
        img.src = node.attrs.src;
      }
      if (node.attrs.alt) {
        img.alt = node.attrs.alt;
      }
      if (node.attrs.width) {
        img.style.width = `${node.attrs.width}px`;
        img.setAttribute("width", node.attrs.width);
      }
      if (node.attrs.height) {
        img.style.height = `${node.attrs.height}px`;
        img.setAttribute("height", node.attrs.height);
      }
      
      img.className = "resizable-image";
      img.style.cursor = "pointer";
      img.style.display = "block";
      img.style.maxWidth = "100%";
      if (!node.attrs.width && !node.attrs.height) {
        img.style.height = "auto";
      }
      img.style.borderRadius = "0.5rem";
      img.style.margin = "1rem 0";
      img.style.objectFit = "contain";
      
      // Görsel toolbar (sil, hizalama, boyut bilgisi)
      const toolbar = document.createElement("div");
      toolbar.className = "image-toolbar";
      toolbar.style.cssText = `
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        border-radius: 6px;
        padding: 4px 8px;
        display: none;
        align-items: center;
        gap: 8px;
        z-index: 100;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        white-space: nowrap;
      `;
      
      // Boyut bilgisi
      const sizeInfo = document.createElement("span");
      sizeInfo.className = "image-size-info";
      sizeInfo.style.cssText = `
        color: white;
        font-size: 11px;
        font-weight: 500;
        padding: 0 8px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      
      // Sil butonu
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      deleteBtn.style.cssText = `
        background: transparent;
        border: none;
        color: #ef4444;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      `;
      deleteBtn.title = "Görseli Sil";
      deleteBtn.onmouseenter = () => {
        deleteBtn.style.background = "rgba(239, 68, 68, 0.1)";
      };
      deleteBtn.onmouseleave = () => {
        deleteBtn.style.background = "transparent";
      };
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (pos !== undefined) {
          editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
        }
      };
      
      toolbar.appendChild(sizeInfo);
      toolbar.appendChild(deleteBtn);
      
      // Resize handles - daha büyük ve belirgin
      const createHandle = (position: string) => {
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-handle-${position}`;
        handle.style.cssText = `
          position: absolute;
          background: #d4af37;
          border: 2px solid white;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          cursor: ${position.includes("e") ? "ew-resize" : position.includes("s") ? "ns-resize" : "nwse-resize"};
          z-index: 10;
          display: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s, background 0.2s;
        `;
        handle.onmouseenter = () => {
          handle.style.transform = "scale(1.3)";
          handle.style.background = "#b8941f";
        };
        handle.onmouseleave = () => {
          handle.style.transform = "scale(1)";
          handle.style.background = "#d4af37";
        };
        return handle;
      };
      
      const handles = {
        nw: createHandle("nw"),
        ne: createHandle("ne"),
        sw: createHandle("sw"),
        se: createHandle("se"),
      };
      
      const updateSizeInfo = () => {
        const width = img.offsetWidth || parseInt(img.getAttribute("width") || "0");
        const height = img.offsetHeight || parseInt(img.getAttribute("height") || "0");
        if (width > 0 && height > 0) {
          sizeInfo.textContent = `${width} × ${height}px`;
        } else {
          sizeInfo.textContent = "Orijinal boyut";
        }
      };
      
      // Hizalama ayarını uygula
      const align = node.attrs.align || "left";
      container.setAttribute("data-align", align);
      
      // Container stillerini ayarla
      container.style.position = "relative";
      container.style.maxWidth = "100%";
      container.style.margin = "1rem 0";
      
      if (align === "center") {
        container.style.display = "block";
        container.style.marginLeft = "auto";
        container.style.marginRight = "auto";
        container.style.textAlign = "center";
      } else if (align === "right") {
        container.style.display = "block";
        container.style.marginLeft = "auto";
        container.style.marginRight = "0";
        container.style.textAlign = "right";
      } else {
        container.style.display = "block";
        container.style.marginLeft = "0";
        container.style.marginRight = "auto";
        container.style.textAlign = "left";
      }
      
      container.appendChild(toolbar);
      container.appendChild(img);
      Object.values(handles).forEach(handle => container.appendChild(handle));
      
      // İlk boyut bilgisini güncelle
      img.onload = () => {
        updateSizeInfo();
      };
      updateSizeInfo();
      
      let isResizing = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let aspectRatio = 0;
      
      const updateHandles = () => {
        const rect = img.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        handles.nw.style.left = "-7px";
        handles.nw.style.top = "-7px";
        handles.ne.style.right = "-7px";
        handles.ne.style.top = "-7px";
        handles.sw.style.left = "-7px";
        handles.sw.style.bottom = "-7px";
        handles.se.style.right = "-7px";
        handles.se.style.bottom = "-7px";
        
        Object.values(handles).forEach(handle => {
          handle.style.display = "block";
        });
        
        // Toolbar'ı göster ve konumlandır
        toolbar.style.display = "flex";
        updateSizeInfo();
        
        // Seçildiğinde kenar çizgisini göster
        container.classList.add("selected");
        img.style.border = "3px solid #d4af37";
        img.style.boxShadow = "0 0 0 1px rgba(212, 175, 55, 0.3), 0 4px 12px rgba(212, 175, 55, 0.2)";
      };
      
      const hideHandles = () => {
        Object.values(handles).forEach(handle => {
          handle.style.display = "none";
        });
        
        // Toolbar'ı gizle
        toolbar.style.display = "none";
        
        // Seçim kaldırıldığında kenar çizgisini gizle
        container.classList.remove("selected");
        img.style.border = "none";
        img.style.boxShadow = "none";
      };
      
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (pos !== undefined) {
          editor.commands.setNodeSelection(pos);
          updateHandles();
        }
      });
      
      const handleMouseDown = (e: MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        aspectRatio = startWidth / startHeight;
        
        const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;
          
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          let newWidth = startWidth;
          let newHeight = startHeight;
          
          // Sadece güneydoğu (se) ve güneybatı (sw) köşelerini kullan
          // Diğer köşeler için de aynı mantığı uygula
          if (handle === "se") {
            newWidth = Math.max(50, Math.min(startWidth + deltaX, container.parentElement?.clientWidth || Infinity));
            newHeight = newWidth / aspectRatio;
          } else if (handle === "sw") {
            newWidth = Math.max(50, Math.min(startWidth - deltaX, container.parentElement?.clientWidth || Infinity));
            newHeight = newWidth / aspectRatio;
          } else if (handle === "ne") {
            newWidth = Math.max(50, Math.min(startWidth + deltaX, container.parentElement?.clientWidth || Infinity));
            newHeight = newWidth / aspectRatio;
          } else if (handle === "nw") {
            newWidth = Math.max(50, Math.min(startWidth - deltaX, container.parentElement?.clientWidth || Infinity));
            newHeight = newWidth / aspectRatio;
          }
          
          img.style.width = `${newWidth}px`;
          img.style.height = `${newHeight}px`;
          img.style.maxWidth = "100%";
          img.setAttribute("width", newWidth.toString());
          img.setAttribute("height", newHeight.toString());
          
          // Boyut bilgisini güncelle
          updateSizeInfo();
        };
        
        const handleMouseUp = () => {
          if (isResizing) {
            const width = parseInt(img.getAttribute("width") || img.style.width || "0");
            const height = parseInt(img.getAttribute("height") || img.style.height || "0");
            
            const pos = typeof getPos === "function" ? getPos() : undefined;
            if (pos !== undefined && width > 0 && height > 0) {
              editor.commands.setNodeSelection(pos);
              editor.commands.updateAttributes("image", {
                width: width,
                height: height,
              });
            }
          }
          isResizing = false;
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };
        
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      };
      
      handles.se.addEventListener("mousedown", (e) => handleMouseDown(e, "se"));
      handles.sw.addEventListener("mousedown", (e) => handleMouseDown(e, "sw"));
      handles.ne.addEventListener("mousedown", (e) => handleMouseDown(e, "ne"));
      handles.nw.addEventListener("mousedown", (e) => handleMouseDown(e, "nw"));
      
      // Editor dışına tıklandığında handles'ları gizle
      const handleClickOutside = (e: MouseEvent) => {
        if (!container.contains(e.target as Node)) {
          hideHandles();
        }
      };
      
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
      
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "image") {
            return false;
          }
          if (updatedNode.attrs.src !== img.src) {
            img.src = updatedNode.attrs.src;
          }
          if (updatedNode.attrs.alt !== img.alt) {
            img.alt = updatedNode.attrs.alt || "";
          }
          if (updatedNode.attrs.width) {
            img.style.width = `${updatedNode.attrs.width}px`;
            img.setAttribute("width", updatedNode.attrs.width);
          }
          if (updatedNode.attrs.height) {
            img.style.height = `${updatedNode.attrs.height}px`;
            img.setAttribute("height", updatedNode.attrs.height);
          }
          
          // Hizalama güncellemesi
          const align = updatedNode.attrs.align || "left";
          container.setAttribute("data-align", align);
          
          // Container stillerini güncelle
          container.style.position = "relative";
          container.style.maxWidth = "100%";
          container.style.margin = "1rem 0";
          
          if (align === "center") {
            container.style.display = "block";
            container.style.marginLeft = "auto";
            container.style.marginRight = "auto";
            container.style.textAlign = "center";
          } else if (align === "right") {
            container.style.display = "block";
            container.style.marginLeft = "auto";
            container.style.marginRight = "0";
            container.style.textAlign = "right";
          } else {
            container.style.display = "block";
            container.style.marginLeft = "0";
            container.style.marginRight = "auto";
            container.style.textAlign = "left";
          }
          
          updateSizeInfo();
          return true;
        },
      };
    };
  },
});

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "İçeriğinizi buraya yazın...",
}: RichTextEditorProps) {
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-luxury-goldLight hover:text-luxury-goldDark underline",
        },
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4 block",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 px-4 py-2 font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        defaultAlignment: "left",
      }),
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Görsel seçildiğinde tüm görsel container'larını kontrol et
      const allContainers = document.querySelectorAll(".image-resize-container");
      allContainers.forEach((container) => {
        container.classList.remove("selected");
        const img = container.querySelector(".resizable-image") as HTMLImageElement;
        const toolbar = container.querySelector(".image-toolbar") as HTMLElement;
        if (img) {
          img.style.border = "none";
          img.style.boxShadow = "none";
        }
        if (toolbar) {
          toolbar.style.display = "none";
        }
        const handles = container.querySelectorAll(".resize-handle");
        handles.forEach((handle) => {
          (handle as HTMLElement).style.display = "none";
        });
      });
      
      // Seçili görseli bul ve handles'ları göster
      if (editor.isActive("image")) {
        const { from } = editor.state.selection;
        const node = editor.state.doc.nodeAt(from);
        if (node && node.type.name === "image") {
          // Editor içindeki tüm görsel container'larını bul
          const editorElement = editor.view.dom;
          const imageContainers = editorElement.querySelectorAll(".image-resize-container");
          imageContainers.forEach((container) => {
            const img = container.querySelector(".resizable-image") as HTMLImageElement;
            const toolbar = container.querySelector(".image-toolbar") as HTMLElement;
            if (img && img.src === node.attrs.src) {
              container.classList.add("selected");
              if (img) {
                img.style.border = "3px solid #d4af37";
                img.style.boxShadow = "0 0 0 1px rgba(212, 175, 55, 0.3), 0 4px 12px rgba(212, 175, 55, 0.2)";
              }
              if (toolbar) {
                toolbar.style.display = "flex";
                // Boyut bilgisini güncelle
                const sizeInfo = toolbar.querySelector(".image-size-info");
                if (sizeInfo) {
                  const width = img.offsetWidth || parseInt(img.getAttribute("width") || "0");
                  const height = img.offsetHeight || parseInt(img.getAttribute("height") || "0");
                  if (width > 0 && height > 0) {
                    sizeInfo.textContent = `${width} × ${height}px`;
                  } else {
                    sizeInfo.textContent = "Orijinal boyut";
                  }
                }
              }
              const handles = container.querySelectorAll(".resize-handle");
              handles.forEach((handle) => {
                (handle as HTMLElement).style.display = "block";
              });
            }
          });
        }
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-4 py-3 font-sans",
        "data-placeholder": placeholder,
      },
    },
  });

  if (!editor) {
    return null;
  }


  const toggleViewMode = () => {
    if (viewMode === "visual") {
      // Görselden koda geçiş - HTML zaten editor'da, sadece modu değiştir
      setViewMode("code");
    } else {
      // Koddan görsele geçiş - textarea'dan HTML'i al ve editor'a set et
      const textarea = document.getElementById("code-editor") as HTMLTextAreaElement;
      if (textarea) {
        const htmlContent = textarea.value || "";
        editor.commands.setContent(htmlContent);
        onChange(htmlContent);
      }
      setViewMode("visual");
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-luxury-goldLight text-white"
          : "text-gray-700 hover:bg-gray-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {/* Görünüm Modu */}
        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
          <ToolbarButton
            onClick={toggleViewMode}
            title={viewMode === "visual" ? "Kod Görünümüne Geç" : "Görsel Görünümüne Geç"}
          >
            {viewMode === "visual" ? (
              <FileCode className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </ToolbarButton>
        </div>

        {viewMode === "visual" && (
          <>
            {/* Metin Formatlama */}
            <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Kalın (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="İtalik (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title="Alt Çizgi (Ctrl+U)"
              >
                <UnderlineIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Üstü Çizili"
              >
                <Strikethrough className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
                title="Kod"
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Başlıklar */}
            <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                title="Başlık 1"
              >
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                title="Başlık 2"
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
                title="Başlık 3"
              >
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Listeler */}
            <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Madde İşareti Listesi"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Numaralı Liste"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Alıntı"
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Hizalama */}
            <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
              <ToolbarButton
                onClick={() => {
                  if (editor.isActive("image")) {
                    // Görsel seçiliyse görsel hizalaması yap
                    const currentAttrs = editor.getAttributes("image");
                    editor.chain().focus().updateAttributes("image", { ...currentAttrs, align: "left" }).run();
                    // Editor'ı güncellemek için bir tick bekleyelim
                    setTimeout(() => {
                      editor.view.dom.dispatchEvent(new Event("input", { bubbles: true }));
                    }, 0);
                  } else {
                    // Normal metin hizalaması
                    editor.chain().focus().setTextAlign("left").run();
                  }
                }}
                isActive={
                  editor.isActive({ textAlign: "left" }) ||
                  (editor.isActive("image") && (editor.getAttributes("image").align === "left" || !editor.getAttributes("image").align))
                }
                title="Sola Hizala"
              >
                <AlignLeft className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  if (editor.isActive("image")) {
                    // Görsel seçiliyse görsel hizalaması yap
                    const currentAttrs = editor.getAttributes("image");
                    editor.chain().focus().updateAttributes("image", { ...currentAttrs, align: "center" }).run();
                    // Editor'ı güncellemek için bir tick bekleyelim
                    setTimeout(() => {
                      editor.view.dom.dispatchEvent(new Event("input", { bubbles: true }));
                    }, 0);
                  } else {
                    // Normal metin hizalaması
                    editor.chain().focus().setTextAlign("center").run();
                  }
                }}
                isActive={
                  editor.isActive({ textAlign: "center" }) ||
                  (editor.isActive("image") && editor.getAttributes("image").align === "center")
                }
                title="Ortala"
              >
                <AlignCenter className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  if (editor.isActive("image")) {
                    // Görsel seçiliyse görsel hizalaması yap
                    const currentAttrs = editor.getAttributes("image");
                    editor.chain().focus().updateAttributes("image", { ...currentAttrs, align: "right" }).run();
                    // Editor'ı güncellemek için bir tick bekleyelim
                    setTimeout(() => {
                      editor.view.dom.dispatchEvent(new Event("input", { bubbles: true }));
                    }, 0);
                  } else {
                    // Normal metin hizalaması
                    editor.chain().focus().setTextAlign("right").run();
                  }
                }}
                isActive={
                  editor.isActive({ textAlign: "right" }) ||
                  (editor.isActive("image") && editor.getAttributes("image").align === "right")
                }
                title="Sağa Hizala"
              >
                <AlignRight className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Link ve Görsel */}
            <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Link URL'sini girin:");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                isActive={editor.isActive("link")}
                title="Link Ekle"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Görsel URL'sini girin:");
                  if (url && url.trim()) {
                    editor.chain().focus().setImage({ src: url.trim() }).run();
                  }
                }}
                title="Görsel Ekle"
              >
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Tablo */}
            <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
              <ToolbarButton
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                }}
                title="Tablo Ekle"
              >
                <TableIcon className="w-4 h-4" />
              </ToolbarButton>
              {editor.isActive("table") && (
                <>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    disabled={!editor.can().addColumnBefore()}
                    title="Sütun Ekle (Önce)"
                  >
                    <Columns className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    disabled={!editor.can().addColumnAfter()}
                    title="Sütun Ekle (Sonra)"
                  >
                    <Plus className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    disabled={!editor.can().addRowBefore()}
                    title="Satır Ekle (Üst)"
                  >
                    <Rows className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    disabled={!editor.can().addRowAfter()}
                    title="Satır Ekle (Alt)"
                  >
                    <Plus className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    disabled={!editor.can().deleteColumn()}
                    title="Sütun Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    disabled={!editor.can().deleteRow()}
                    title="Satır Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    disabled={!editor.can().deleteTable()}
                    title="Tablo Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </ToolbarButton>
                </>
              )}
            </div>

            {/* Geri Al / Yinele */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Geri Al (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Yinele (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </>
        )}

        {viewMode === "code" && (
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-auto">
            <Code2 className="w-4 h-4" />
            <span>HTML Kod Görünümü</span>
          </div>
        )}
      </div>

      {/* Editor Content */}
      {viewMode === "visual" ? (
        <EditorContent
          editor={editor}
          className="min-h-[400px] max-h-[600px] overflow-y-auto font-sans"
        />
      ) : (
        <textarea
          id="code-editor"
          value={editor?.getHTML() || ""}
          onChange={(e) => {
            if (editor) {
              editor.commands.setContent(e.target.value);
              onChange(e.target.value);
            }
          }}
          className="w-full min-h-[400px] max-h-[600px] p-4 font-mono text-sm border-0 focus:outline-none resize-none text-gray-900 bg-white"
          placeholder={placeholder || "HTML kodunu buraya yazın..."}
        />
      )}

      {/* SEO Bilgilendirme */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
        <p>
          💡 <strong>SEO İpucu:</strong> Başlıklar (H1, H2, H3) kullanarak içeriğinizi yapılandırın. 
          Görseller için alt text ekleyin. Linkler için açıklayıcı metinler kullanın.
        </p>
      </div>
    </div>
  );
}

