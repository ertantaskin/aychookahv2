import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}`;

// R2 endpoint (Cloudflare R2 uses S3-compatible API)
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

// Validate environment variables
export function validateR2Config(): void {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error("R2 configuration is missing. Please check your environment variables.");
  }
}

/**
 * Clean file name: remove Turkish characters, replace spaces with dashes, remove special chars
 */
export function cleanFileName(fileName: string): string {
  // Get extension
  const lastDotIndex = fileName.lastIndexOf(".");
  const extension = lastDotIndex > -1 ? fileName.substring(lastDotIndex) : "";
  const nameWithoutExt = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;

  // Turkish character mapping
  const turkishMap: { [key: string]: string } = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  // Replace Turkish characters
  let cleaned = nameWithoutExt;
  Object.keys(turkishMap).forEach((char) => {
    cleaned = cleaned.replace(new RegExp(char, "g"), turkishMap[char]);
  });

  // Convert to lowercase
  cleaned = cleaned.toLowerCase();

  // Replace spaces and multiple dashes/underscores with single dash
  cleaned = cleaned.replace(/[\s_]+/g, "-");

  // Remove special characters except dashes and dots
  cleaned = cleaned.replace(/[^a-z0-9\-]/g, "");

  // Remove multiple consecutive dashes
  cleaned = cleaned.replace(/-+/g, "-");

  // Remove leading and trailing dashes
  cleaned = cleaned.replace(/^-+|-+$/g, "");

  // If cleaned name is empty, use a default
  if (!cleaned) {
    cleaned = "image";
  }

  return cleaned + extension;
}

/**
 * Generate a clean file name for upload
 * Files will be stored in images/ folder with clean names
 */
export function generateFileName(originalName: string, userId?: string): string {
  // Clean the original file name
  const cleanedName = cleanFileName(originalName);
  
  // Get extension from cleaned name
  const lastDotIndex = cleanedName.lastIndexOf(".");
  const extension = lastDotIndex > -1 ? cleanedName.substring(lastDotIndex) : "";
  const nameWithoutExt = lastDotIndex > -1 ? cleanedName.substring(0, lastDotIndex) : cleanedName;

  // Use images/ folder and clean file name
  // If name already exists, add timestamp for uniqueness
  const basePath = "images/";
  const fileName = `${basePath}${nameWithoutExt}${extension}`;
  
  return fileName;
}

/**
 * Get presigned URL for uploading a file
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  validateR2Config();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Get presigned URL for downloading a file
 */
export async function getPresignedDownloadUrl(
  fileName: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  validateR2Config();

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Upload file directly to R2 (server-side upload)
 */
export async function uploadFile(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<string> {
  validateR2Config();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return public URL
  return `${R2_PUBLIC_URL}/${fileName}`;
}

/**
 * Delete file from R2
 */
export async function deleteFile(fileName: string): Promise<void> {
  validateR2Config();

  if (!fileName || fileName.trim() === "") {
    throw new Error("Dosya adı boş olamaz");
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName.trim(),
  });

  try {
    await s3Client.send(command);
    console.log(`File deleted from R2: ${fileName}`);
  } catch (error: any) {
    console.error(`Error deleting file from R2: ${fileName}`, error);
    // Re-throw the error so caller can handle it
    throw new Error(`R2'den dosya silinirken hata: ${error.message || "Bilinmeyen hata"}`);
  }
}

/**
 * Copy file from one location to another in R2
 */
export async function copyFile(sourceKey: string, destinationKey: string): Promise<void> {
  validateR2Config();

  if (!sourceKey || !destinationKey) {
    throw new Error("Kaynak ve hedef dosya adları gerekli");
  }

  const command = new CopyObjectCommand({
    Bucket: R2_BUCKET_NAME,
    CopySource: `${R2_BUCKET_NAME}/${sourceKey}`,
    Key: destinationKey,
  });

  try {
    await s3Client.send(command);
    console.log(`File copied from ${sourceKey} to ${destinationKey}`);
  } catch (error: any) {
    console.error(`Error copying file in R2: ${sourceKey} -> ${destinationKey}`, error);
    throw new Error(`R2'de dosya kopyalanırken hata: ${error.message || "Bilinmeyen hata"}`);
  }
}

/**
 * Move file from one location to another in R2 (copy + delete)
 */
export async function moveFile(sourceKey: string, destinationKey: string): Promise<void> {
  validateR2Config();

  try {
    // First copy the file
    await copyFile(sourceKey, destinationKey);
    // Then delete the source file
    await deleteFile(sourceKey);
    console.log(`File moved from ${sourceKey} to ${destinationKey}`);
  } catch (error: any) {
    console.error(`Error moving file in R2: ${sourceKey} -> ${destinationKey}`, error);
    throw new Error(`R2'de dosya taşınırken hata: ${error.message || "Bilinmeyen hata"}`);
  }
}

/**
 * List files in R2 bucket
 */
export async function listFiles(prefix?: string, maxKeys: number = 1000): Promise<string[]> {
  validateR2Config();

  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response = await s3Client.send(command);
  return (response.Contents || []).map((item) => item.Key || "").filter(Boolean);
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(fileName: string): string {
  return `${R2_PUBLIC_URL}/${fileName}`;
}

/**
 * Extract file name from R2 URL
 */
export function extractFileNameFromUrl(url: string): string {
  try {
    // Remove protocol and domain, get the path
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    // Remove leading slash
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
    
    // If path is empty, try to extract from the full URL
    if (!path) {
      // Try to match R2_PUBLIC_URL pattern
      if (url.includes(R2_PUBLIC_URL)) {
        path = url.split(R2_PUBLIC_URL)[1];
        if (path.startsWith("/")) {
          path = path.substring(1);
        }
      } else {
        // Extract everything after the last slash
        const parts = url.split("/");
        path = parts[parts.length - 1];
        // If there's a query string, remove it
        if (path.includes("?")) {
          path = path.split("?")[0];
        }
      }
    }
    
    // Remove query string if exists
    if (path.includes("?")) {
      path = path.split("?")[0];
    }
    
    // Remove hash if exists
    if (path.includes("#")) {
      path = path.split("#")[0];
    }
    
    return path || url; // Fallback to original URL if extraction fails
  } catch (error) {
    console.error("Error extracting file name from URL:", url, error);
    // Fallback: try to get the last part of the URL
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.split("?")[0].split("#")[0] || url;
  }
}

