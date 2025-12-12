"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tag, X, Check } from "lucide-react";

interface CartItem {
  productId: string;
  product?: {
    id: string;
    price: number;
    categoryId?: string | null;
  } | null;
  quantity: number;
}

interface CouponInputProps {
  onCouponApplied: (coupon: {
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  }) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null;
  cartSubtotal: number;
  productIds: string[];
  shippingCost: number;
  cartItems?: CartItem[];
}

export default function CouponInput({
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  cartSubtotal,
  productIds,
  shippingCost,
  cartItems = [],
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("Lütfen bir kupon kodu girin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          cartSubtotal,
          productIds,
          shippingCost,
          cartItems: cartItems.map((item) => ({
            productId: item.productId,
            product: item.product ? {
              id: item.product.id,
              price: item.product.price,
              categoryId: item.product.categoryId,
            } : null,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.valid) {
        onCouponApplied({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        setCode("");
        toast.success("Kupon başarıyla uygulandı!");
      } else {
        toast.error(data.error || "Kupon geçersiz");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Kupon uygulanırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onCouponRemoved();
    toast.success("Kupon kaldırıldı");
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-sans font-medium text-green-900">
                Kupon uygulandı: <span className="font-semibold">{appliedCoupon.code}</span>
              </p>
              <p className="text-xs font-sans text-green-700 mt-1">
                {appliedCoupon.discountType === "PERCENTAGE"
                  ? `%${appliedCoupon.discountValue} indirim`
                  : appliedCoupon.discountType === "FIXED_AMOUNT"
                  ? `${appliedCoupon.discountAmount.toFixed(2)} TL indirim`
                  : appliedCoupon.discountType === "FREE_SHIPPING"
                  ? "Ücretsiz kargo"
                  : appliedCoupon.discountType === "BUY_X_GET_Y"
                  ? `${appliedCoupon.discountAmount.toFixed(2)} TL indirim (X Alana Y Bedava)`
                  : "İndirim uygulandı"}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 text-green-600 hover:text-green-700 transition-colors"
            title="Kuponu kaldır"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-5 h-5 text-gray-600" />
        <label className="text-sm font-sans font-medium text-gray-700">
          İndirim Kuponu
        </label>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Kupon kodunu girin"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight font-sans text-sm text-gray-900"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-6 py-2 bg-luxury-goldLight text-luxury-black rounded-lg hover:bg-luxury-gold transition-colors font-sans text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uygulanıyor..." : "Uygula"}
        </button>
      </div>
    </div>
  );
}
