/**
 * Clean file name: remove Turkish characters, replace spaces with dashes, remove special chars
 * This is a client-safe version of the file name cleaning function
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

