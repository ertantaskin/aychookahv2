"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

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
      
      // Görsel toolbar (sil, boyut bilgisi)
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
      
      // Resize handles
      const createHandle = (position: string) => {
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-handle-${position}`;
        handle.style.cssText = `
          position: absolute;
          background: #3b82f6;
          border: 2px solid white;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          cursor: ${position.includes("e") ? "ew-resize" : position.includes("s") ? "ns-resize" : "nwse-resize"};
          z-index: 10;
          display: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s, background 0.2s;
        `;
        handle.onmouseenter = () => {
          handle.style.transform = "scale(1.3)";
          handle.style.background = "#2563eb";
        };
        handle.onmouseleave = () => {
          handle.style.transform = "scale(1)";
          handle.style.background = "#3b82f6";
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
      
      container.style.position = "relative";
      container.style.display = "inline-block";
      container.style.maxWidth = "100%";
      container.style.margin = "1rem 0";
      
      container.appendChild(toolbar);
      container.appendChild(img);
      Object.values(handles).forEach(handle => container.appendChild(handle));
      
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
        
        toolbar.style.display = "flex";
        updateSizeInfo();
        
        container.classList.add("selected");
        img.style.border = "3px solid #3b82f6";
        img.style.boxShadow = "0 0 0 1px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2)";
      };
      
      const hideHandles = () => {
        Object.values(handles).forEach(handle => {
          handle.style.display = "none";
        });
        
        toolbar.style.display = "none";
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
          updateSizeInfo();
          return true;
        },
      };
    };
  },
});
import { useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
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
  AlignJustify,
  Undo,
  Redo,
  Code,
  ChevronDown,
} from "lucide-react";

interface SimpleEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export function SimpleEditor({
  content = "",
  onChange,
  placeholder = "İçeriğinizi buraya yazın...",
}: SimpleEditorProps) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

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
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
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
          const editorElement = editor.view.dom;
          const imageContainers = editorElement.querySelectorAll(".image-resize-container");
          imageContainers.forEach((container) => {
            const img = container.querySelector(".resizable-image") as HTMLImageElement;
            const toolbar = container.querySelector(".image-toolbar") as HTMLElement;
            if (img && img.src === node.attrs.src) {
              container.classList.add("selected");
              if (img) {
                img.style.border = "3px solid #3b82f6";
                img.style.boxShadow = "0 0 0 1px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2)";
              }
              if (toolbar) {
                toolbar.style.display = "flex";
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
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

  if (!editor) {
    return null;
  }

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
      className={`p-2 rounded transition-colors ${
        isActive
          ? "bg-gray-200 text-gray-900"
          : "text-gray-600 hover:bg-gray-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const handleAddLink = () => {
    if (linkUrl) {
      if (linkText) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
      setLinkUrl("");
      setLinkText("");
      setShowLinkMenu(false);
    }
  };

  const handleAddImage = () => {
    const url = window.prompt("Görsel URL'sini girin:");
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  const currentHeading = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
    ? "H2"
    : editor.isActive("heading", { level: 3 })
    ? "H3"
    : "Paragraf";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {/* Heading Dropdown */}
        <div className="relative mr-2 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            className="flex items-center gap-1 px-3 py-2 rounded transition-colors text-gray-600 hover:bg-gray-100 text-sm font-medium"
          >
            {currentHeading}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showHeadingMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowHeadingMenu(false)}
              />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[120px]">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setParagraph().run();
                    setShowHeadingMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className="text-gray-400">P</span>
                  <span>Paragraf</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                    setShowHeadingMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Heading1 className="w-4 h-4" />
                  <span>Başlık 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                    setShowHeadingMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Heading2 className="w-4 h-4" />
                  <span>Başlık 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                    setShowHeadingMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Heading3 className="w-4 h-4" />
                  <span>Başlık 3</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Text Formatting */}
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
        </div>

        {/* Lists */}
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
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Kod Bloğu"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Sola Hizala"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Ortala"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Sağa Hizala"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="İki Yana Yasla"
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Link and Image */}
        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowLinkMenu(!showLinkMenu)}
              isActive={editor.isActive("link")}
              title="Link Ekle"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            {showLinkMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowLinkMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-3 min-w-[300px]">
                  <input
                    type="text"
                    placeholder="URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddLink();
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Link Metni (opsiyonel)"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddLink();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editor.isActive("link")) {
                          editor.chain().focus().unsetLink().run();
                        }
                        setShowLinkMenu(false);
                      }}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <ToolbarButton onClick={handleAddImage} title="Görsel Ekle">
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
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
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[300px] max-h-[600px] overflow-y-auto"
      />
    </div>
  );
}

export default SimpleEditor;

