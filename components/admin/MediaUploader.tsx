"use client";

import { useState, useCallback } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cleanFileName } from "@/lib/utils/file-name";

interface MediaUploaderProps {
  onUploadComplete?: (media: any) => void;
  multiple?: boolean;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  media?: any;
}

export default function MediaUploader({
  onUploadComplete,
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
}: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return "Sadece görsel dosyaları yüklenebilir (JPG, PNG, WebP, GIF, SVG)";
    }

    // Check file size
    if (file.size > maxSize) {
      return `Dosya boyutu ${(maxSize / (1024 * 1024)).toFixed(0)}MB'dan büyük olamaz`;
    }

    return null;
  };

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const newFiles: UploadFile[] = [];

      Array.from(fileList).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          return;
        }

        newFiles.push({
          file,
          id: Math.random().toString(36).substring(7),
          progress: 0,
          status: "pending",
        });
      });

      if (newFiles.length === 0) return;

      setFiles((prev) => [...prev, ...newFiles]);

      // Upload files
      for (const uploadFile of newFiles) {
        await uploadFileToR2(uploadFile);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxSize, allowedTypes]
  );

  const uploadFileToR2 = async (uploadFile: UploadFile) => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading", progress: 10 } : f
        )
      );

      // Step 1: Get presigned URL
      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFile.file.name,
          contentType: uploadFile.file.type,
          originalName: uploadFile.file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Upload URL alınamadı");
      }

      const { uploadUrl, fileName, publicUrl } = await response.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 30 } : f
        )
      );

      // Step 2: Upload to R2 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: uploadFile.file,
        headers: {
          "Content-Type": uploadFile.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Dosya yüklenemedi");
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 70 } : f
        )
      );

      // Step 3: Create media record
      // Use cleaned file name for display
      const cleanedName = cleanFileName(uploadFile.file.name);
      const mediaResponse = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanedName,
          url: publicUrl,
          type: "image",
          size: uploadFile.file.size,
          mimeType: uploadFile.file.type,
          fileName,
        }),
      });

      if (!mediaResponse.ok) {
        throw new Error("Medya kaydı oluşturulamadı");
      }

      const { media } = await mediaResponse.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "success", progress: 100, media }
            : f
        )
      );

      toast.success(`${uploadFile.file.name} yüklendi`);
      onUploadComplete?.(media);
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: error.message }
            : f
        )
      );
      toast.error(`${uploadFile.file.name}: ${error.message}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-luxury-goldLight bg-luxury-goldLight/10"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          id="media-upload"
          className="hidden"
          multiple={multiple}
          accept={allowedTypes.join(",")}
          onChange={handleFileInput}
        />
        <label
          htmlFor="media-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <span className="font-sans text-sm font-semibold text-gray-700">
              Dosyaları buraya sürükleyin
            </span>
            <span className="font-sans text-sm text-gray-500 block mt-1">
              veya dosya seçmek için tıklayın
            </span>
          </div>
          <span className="font-sans text-xs text-gray-400">
            Maksimum {(maxSize / (1024 * 1024)).toFixed(0)}MB
          </span>
        </label>
      </div>

      {/* Upload Progress */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {uploadFile.status === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : uploadFile.status === "error" ? (
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-luxury-goldLight border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  )}
                  <span className="font-sans text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </span>
                  <span className="font-sans text-xs text-gray-500 flex-shrink-0">
                    {formatFileSize(uploadFile.file.size)}
                  </span>
                </div>
                {(uploadFile.status === "success" || uploadFile.status === "error") && (
                  <button
                    type="button"
                    onClick={() => removeFile(uploadFile.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              {uploadFile.status === "uploading" && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-luxury-goldLight h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadFile.progress}%` }}
                  />
                </div>
              )}
              {uploadFile.status === "error" && uploadFile.error && (
                <p className="font-sans text-xs text-red-500 mt-1">{uploadFile.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

