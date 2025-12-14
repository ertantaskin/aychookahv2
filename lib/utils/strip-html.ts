/**
 * HTML etiketlerini temizler ve sadece metin içeriğini döndürür
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  
  // HTML etiketlerini kaldır
  const text = html
    .replace(/<[^>]*>/g, "") // Tüm HTML etiketlerini kaldır
    .replace(/&nbsp;/g, " ") // &nbsp; karakterlerini boşlukla değiştir
    .replace(/&amp;/g, "&") // &amp; karakterlerini & ile değiştir
    .replace(/&lt;/g, "<") // &lt; karakterlerini < ile değiştir
    .replace(/&gt;/g, ">") // &gt; karakterlerini > ile değiştir
    .replace(/&quot;/g, '"') // &quot; karakterlerini " ile değiştir
    .replace(/&#39;/g, "'") // &#39; karakterlerini ' ile değiştir
    .trim(); // Başında ve sonundaki boşlukları temizle
  
  return text;
}

/**
 * Metni belirli bir uzunluğa kısaltır ve sonuna "..." ekler
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

