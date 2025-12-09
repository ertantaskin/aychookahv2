"use client";

import { useState } from "react";
import { addReview } from "@/lib/actions/reviews";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Lütfen bir puan seçin");
      return;
    }

    if (!comment.trim()) {
      toast.error("Lütfen yorumunuzu yazın");
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        rating,
        comment: comment.trim(),
        productId,
      });

      toast.success("Yorumunuz gönderildi. Admin onayından sonra yayınlanacaktır.");
      setRating(0);
      setComment("");
      setHoveredRating(0);
      
      if (onSuccess) {
        onSuccess();
      }
      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Yorum eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-5">
      <div>
        <label className="font-sans text-sm font-medium text-gray-700 mb-3 block">
          Puanınız
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-all hover:scale-110 active:scale-95"
              aria-label={`${star} yıldız`}
            >
              <svg
                className={`w-7 h-7 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="font-sans text-sm font-medium text-gray-600 ml-3">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="font-sans text-sm font-medium text-gray-700 mb-2 block">
          Yorumunuz
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          className="font-sans w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-transparent transition-all resize-none bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-sans text-xs text-gray-500">
            {comment.length > 0 && (
              <span className={comment.length > 900 ? "text-orange-500" : ""}>
                {comment.length} / 1000 karakter
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="font-sans flex-1 px-5 py-2.5 bg-luxury-black text-white font-medium rounded-lg hover:bg-luxury-darkGray transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Gönderiliyor...</span>
            </>
          ) : (
            "Yorumu Gönder"
          )}
        </button>
      </div>
    </form>
  );
}

