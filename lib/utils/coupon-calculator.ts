import type { DiscountType, Coupon } from "@prisma/client";

interface CartItem {
  productId: string;
  product?: {
    id: string;
    price: number;
    categoryId?: string | null;
  } | null;
  quantity: number;
}

interface CalculateCouponDiscountParams {
  coupon: Coupon;
  cartSubtotal: number;
  shippingCost: number;
  cartItems?: CartItem[]; // BUY_X_GET_Y için gerekli
}

/**
 * Kupon indirim tutarını hesapla
 */
export function calculateCouponDiscount({
  coupon,
  cartSubtotal,
  shippingCost,
  cartItems = [],
}: CalculateCouponDiscountParams): number {
  switch (coupon.discountType) {
    case "PERCENTAGE":
      // Yüzdelik indirim: subtotal * (discountValue / 100)
      const percentageDiscount = cartSubtotal * (coupon.discountValue / 100);
      return Math.min(percentageDiscount, cartSubtotal); // İndirim subtotal'dan fazla olamaz

    case "FIXED_AMOUNT":
      // Sabit tutar indirimi: discountValue (max subtotal)
      return Math.min(coupon.discountValue, cartSubtotal);

    case "FREE_SHIPPING":
      // Ücretsiz kargo: shippingCost kadar indirim
      return shippingCost;

    case "BUY_X_GET_Y":
      // Yeni esnek BUY_X_GET_Y mantığı
      if (!coupon.buyMode || cartItems.length === 0) {
        return 0;
      }

      const buyMode = coupon.buyMode;

      // Mod 1: İki Kategori (CATEGORY)
      if (buyMode === "CATEGORY") {
        if (!coupon.buyTargetId || !coupon.getTargetId || !coupon.buyQuantity || !coupon.getQuantity) {
          return 0;
        }

        // Sepette buyTargetId kategorisindeki ürünlerin toplam adetini hesapla
        const buyCategoryItems = cartItems.filter(
          (item) => item.product?.categoryId === coupon.buyTargetId
        );

        if (buyCategoryItems.length === 0) {
          return 0;
        }

        const buyCategoryQuantity = buyCategoryItems.reduce((sum, item) => sum + item.quantity, 0);

        // buyQuantity (N) adet varsa, kaç set olduğunu hesapla
        const sets = Math.floor(buyCategoryQuantity / coupon.buyQuantity);

        if (sets === 0) {
          return 0;
        }

        // Her set için getQuantity (M) adet bedava ürün ver
        const freeQuantity = sets * coupon.getQuantity;

        // getTargetId kategorisindeki ürünleri bul
        const getCategoryItems = cartItems.filter(
          (item) => item.product?.categoryId === coupon.getTargetId
        );

        if (getCategoryItems.length === 0) {
          return 0;
        }

        // En düşük fiyatlı ürünlerden bedava ver
        // Ürünleri fiyata göre sırala (düşükten yükseğe)
        const sortedItems = [...getCategoryItems].sort((a, b) => {
          const priceA = a.product?.price || 0;
          const priceB = b.product?.price || 0;
          return priceA - priceB;
        });

        // Bedava verilecek ürünlerin toplam fiyatını hesapla
        let remainingFreeQuantity = freeQuantity;
        let discountAmount = 0;

        for (const item of sortedItems) {
          if (remainingFreeQuantity <= 0) break;

          const itemPrice = item.product?.price || 0;
          const freeFromThisItem = Math.min(remainingFreeQuantity, item.quantity);
          discountAmount += itemPrice * freeFromThisItem;
          remainingFreeQuantity -= freeFromThisItem;
        }

        return Math.min(discountAmount, cartSubtotal);
      }

      // Mod 2: İki Ürün (PRODUCT)
      if (buyMode === "PRODUCT") {
        if (!coupon.buyTargetId || !coupon.getTargetId || !coupon.buyQuantity || !coupon.getQuantity) {
          return 0;
        }

        // Sepette buyTargetId ürününün adetini kontrol et
        const buyProductItem = cartItems.find((item) => item.productId === coupon.buyTargetId);

        if (!buyProductItem || buyProductItem.quantity < coupon.buyQuantity) {
          return 0;
        }

        // buyQuantity (N) adet varsa, kaç set olduğunu hesapla
        const sets = Math.floor(buyProductItem.quantity / coupon.buyQuantity);

        if (sets === 0) {
          return 0;
        }

        // Her set için getQuantity (M) adet getTargetId ürünü bedava
        const freeQuantity = sets * coupon.getQuantity;

        // getTargetId ürününü bul
        const getProductItem = cartItems.find((item) => item.productId === coupon.getTargetId);

        if (!getProductItem) {
          return 0;
        }

        const itemPrice = getProductItem.product?.price || 0;
        const actualFreeQuantity = Math.min(freeQuantity, getProductItem.quantity);
        const discountAmount = itemPrice * actualFreeQuantity;

        return Math.min(discountAmount, cartSubtotal);
      }

      // Mod 3: Koşullu Bedava (CONDITIONAL_FREE)
      if (buyMode === "CONDITIONAL_FREE") {
        if (!coupon.getTargetId) {
          return 0;
        }

        // Koşul 1: buyTargetId kategorisinden ürün var mı?
        let condition1Met = false;
        if (coupon.buyTargetId) {
          const hasBuyCategoryProduct = cartItems.some(
            (item) => item.product?.categoryId === coupon.buyTargetId
          );
          condition1Met = hasBuyCategoryProduct;
        }

        // Koşul 2: Minimum sepet tutarı üzerinde mi?
        let condition2Met = false;
        if (coupon.minimumAmount) {
          condition2Met = cartSubtotal >= coupon.minimumAmount;
        }

        // VEYA mantığı: Her iki koşuldan biri sağlanmalı
        // Eğer buyTargetId yoksa, sadece minimumAmount kontrolü yapılır
        // Eğer minimumAmount yoksa, sadece buyTargetId kontrolü yapılır
        // İkisi de varsa, herhangi biri sağlanmalı
        const conditionMet =
          (coupon.buyTargetId && condition1Met) ||
          (coupon.minimumAmount && condition2Met);

        if (!conditionMet) {
          return 0;
        }

        // getTargetId kategorisindeki TÜM ürünler bedava
        const getCategoryItems = cartItems.filter(
          (item) => item.product?.categoryId === coupon.getTargetId
        );

        if (getCategoryItems.length === 0) {
          return 0;
        }

        // Tüm ürünlerin toplam fiyatını hesapla
        const discountAmount = getCategoryItems.reduce(
          (sum, item) => sum + (item.product?.price || 0) * item.quantity,
          0
        );

        return Math.min(discountAmount, cartSubtotal);
      }

      return 0;

    default:
      return 0;
  }
}

interface ValidateCouponForCartParams {
  coupon: Coupon;
  cartSubtotal: number;
  productIds: string[];
  cartItems?: CartItem[]; // BUY_X_GET_Y için gerekli
  userId?: string;
  currentDate?: Date;
  categoryMap?: Map<string, string>; // Kategori ID -> Kategori ismi mapping
}

/**
 * Sepet için kupon doğrulama
 */
export function validateCouponForCart({
  coupon,
  cartSubtotal,
  productIds,
  cartItems = [],
  userId,
  currentDate = new Date(),
  categoryMap = new Map(),
}: ValidateCouponForCartParams): {
  valid: boolean;
  error?: string;
} {
  // Kategori ismini al (varsa map'ten, yoksa ID'yi göster)
  const getCategoryName = (categoryId: string | null | undefined): string => {
    if (!categoryId) return "";
    return categoryMap.get(categoryId) || categoryId;
  };
  // Aktif kontrolü
  if (!coupon.isActive) {
    return {
      valid: false,
      error: "Bu kupon aktif değil",
    };
  }

  // Tarih kontrolü
  if (coupon.startDate && currentDate < new Date(coupon.startDate)) {
    return {
      valid: false,
      error: "Bu kupon henüz geçerli değil",
    };
  }

  if (coupon.endDate && currentDate > new Date(coupon.endDate)) {
    return {
      valid: false,
      error: "Bu kuponun süresi dolmuş",
    };
  }

  // Minimum tutar kontrolü
  if (coupon.minimumAmount && cartSubtotal < coupon.minimumAmount) {
    return {
      valid: false,
      error: `Bu kupon için minimum sepet tutarı ${coupon.minimumAmount.toFixed(2)} TL olmalıdır`,
    };
  }

  // Ürün kontrolü
  if (coupon.applicableProducts) {
    const applicableProductIds = coupon.applicableProducts as string[];
    const hasApplicableProduct = productIds.some((id) => applicableProductIds.includes(id));
    if (!hasApplicableProduct) {
      return {
        valid: false,
        error: "Bu kupon sepetinizdeki ürünler için geçerli değil",
      };
    }
  }

  // BUY_X_GET_Y için özel kontroller
  if (coupon.discountType === "BUY_X_GET_Y") {
    if (!coupon.buyMode) {
      return {
        valid: false,
        error: "Bu kupon yapılandırılmamış",
      };
    }

    // Mod kontrolü
    if (coupon.buyMode === "CATEGORY" || coupon.buyMode === "PRODUCT") {
      if (!coupon.buyTargetId || !coupon.getTargetId || !coupon.buyQuantity || !coupon.getQuantity) {
        return {
          valid: false,
          error: "Bu kupon yapılandırılmamış",
        };
      }

      if (coupon.buyTargetId === coupon.getTargetId) {
        return {
          valid: false,
          error: "Alınacak ve bedava hedef aynı olamaz",
        };
      }

      // Sepet içeriği kontrolü
      if (coupon.buyMode === "CATEGORY") {
        // buyTargetId kategorisinden ürün olmalı
        const hasBuyCategoryProduct = cartItems.some(
          (item) => item.product?.categoryId === coupon.buyTargetId
        );
        if (!hasBuyCategoryProduct) {
          const buyCategoryName = getCategoryName(coupon.buyTargetId);
          return {
            valid: false,
            error: `Bu kupon için sepette "${buyCategoryName}" kategorisinden ürün bulunmalıdır`,
          };
        }

        // getTargetId kategorisinden ürün olmalı
        const hasGetCategoryProduct = cartItems.some(
          (item) => item.product?.categoryId === coupon.getTargetId
        );
        if (!hasGetCategoryProduct) {
          const getCategoryNameValue = getCategoryName(coupon.getTargetId);
          return {
            valid: false,
            error: `Bu kupon için sepette "${getCategoryNameValue}" kategorisinden ürün bulunmalıdır`,
          };
        }

        // buyQuantity kadar ürün olmalı
        const buyCategoryItems = cartItems.filter(
          (item) => item.product?.categoryId === coupon.buyTargetId
        );
        const buyCategoryQuantity = buyCategoryItems.reduce((sum, item) => sum + item.quantity, 0);
        if (buyCategoryQuantity < coupon.buyQuantity) {
          const buyCategoryName = getCategoryName(coupon.buyTargetId);
          return {
            valid: false,
            error: `Bu kupon için sepette "${buyCategoryName}" kategorisinden en az ${coupon.buyQuantity} adet ürün bulunmalıdır`,
          };
        }
      }

      if (coupon.buyMode === "PRODUCT") {
        // buyTargetId ürünü olmalı
        const buyProductItem = cartItems.find(
          (item) => item.productId === coupon.buyTargetId
        );
        if (!buyProductItem) {
          return {
            valid: false,
            error: "Bu kupon için sepette belirtilen ürün bulunmalıdır",
          };
        }

        // buyQuantity kadar ürün olmalı
        if (buyProductItem.quantity < coupon.buyQuantity) {
          return {
            valid: false,
            error: `Bu kupon için sepette belirtilen ürünlerden en az ${coupon.buyQuantity} adet bulunmalıdır`,
          };
        }

        // getTargetId ürünü olmalı
        const getProductItem = cartItems.find(
          (item) => item.productId === coupon.getTargetId
        );
        if (!getProductItem) {
          return {
            valid: false,
            error: "Bu kupon için sepette bedava verilecek ürün bulunmalıdır",
          };
        }
      }
    }

    if (coupon.buyMode === "CONDITIONAL_FREE") {
      if (!coupon.getTargetId) {
        return {
          valid: false,
          error: "Bu kupon yapılandırılmamış",
        };
      }

      // En az bir koşul olmalı (buyTargetId veya minimumAmount)
      if (!coupon.buyTargetId && !coupon.minimumAmount) {
        return {
          valid: false,
          error: "En az bir koşul belirtilmelidir (kategori veya minimum tutar)",
        };
      }

      // Koşul kontrolü
      let conditionMet = false;

      // Koşul 1: buyTargetId kategorisinden ürün var mı?
      if (coupon.buyTargetId) {
        const hasBuyCategoryProduct = cartItems.some(
          (item) => item.product?.categoryId === coupon.buyTargetId
        );
        conditionMet = hasBuyCategoryProduct;
      }

      // Koşul 2: Minimum tutar üzerinde mi?
      if (coupon.minimumAmount && cartSubtotal >= coupon.minimumAmount) {
        conditionMet = true;
      }

      if (!conditionMet) {
        if (coupon.buyTargetId && coupon.minimumAmount) {
          const buyCategoryName = getCategoryName(coupon.buyTargetId);
          return {
            valid: false,
            error: `Bu kupon için sepette "${buyCategoryName}" kategorisinden ürün bulunmalı VEYA sepet tutarı en az ${coupon.minimumAmount.toFixed(2)} TL olmalıdır`,
          };
        } else if (coupon.buyTargetId) {
          const buyCategoryName = getCategoryName(coupon.buyTargetId);
          return {
            valid: false,
            error: `Bu kupon için sepette "${buyCategoryName}" kategorisinden ürün bulunmalıdır`,
          };
        } else if (coupon.minimumAmount) {
          return {
            valid: false,
            error: `Bu kupon için sepet tutarı en az ${coupon.minimumAmount.toFixed(2)} TL olmalıdır`,
          };
        }
      }

        // getTargetId kategorisinden ürün olmalı
        const hasGetCategoryProduct = cartItems.some(
          (item) => item.product?.categoryId === coupon.getTargetId
        );
        if (!hasGetCategoryProduct) {
          const getCategoryNameValue = getCategoryName(coupon.getTargetId);
          return {
            valid: false,
            error: `Bu kupon için sepette "${getCategoryNameValue}" kategorisinden ürün bulunmalıdır`,
          };
        }
    }
  }

  // Kullanıcı kontrolü
  if (coupon.applicableUsers && userId) {
    const applicableUserIds = coupon.applicableUsers as string[];
    if (!applicableUserIds.includes(userId)) {
      return {
        valid: false,
        error: "Bu kupon sizin için geçerli değil",
      };
    }
  }

  return {
    valid: true,
  };
}

/**
 * BUY_X_GET_Y kuponu için bedava ürünleri tespit et
 * @param coupon Kupon bilgisi
 * @param cartItems Sepet ürünleri
 * @param cartSubtotal Sepet toplamı (CONDITIONAL_FREE için gerekli)
 * @returns Bedava ürünlerin listesi: [{ productId, quantity, price }]
 */
export function getFreeItemsFromCoupon(
  coupon: Coupon,
  cartItems: CartItem[],
  cartSubtotal?: number
): Array<{ productId: string; quantity: number; price: number }> {
  if (coupon.discountType !== "BUY_X_GET_Y" || !coupon.buyMode || cartItems.length === 0) {
    return [];
  }

  const buyMode = coupon.buyMode;
  const freeItems: Array<{ productId: string; quantity: number; price: number }> = [];

  // Mod 1: İki Kategori (CATEGORY)
  if (buyMode === "CATEGORY") {
    if (!coupon.buyTargetId || !coupon.getTargetId || !coupon.buyQuantity || !coupon.getQuantity) {
      return [];
    }

    const buyCategoryItems = cartItems.filter(
      (item) => item.product?.categoryId === coupon.buyTargetId
    );

    if (buyCategoryItems.length === 0) {
      return [];
    }

    const buyCategoryQuantity = buyCategoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const sets = Math.floor(buyCategoryQuantity / coupon.buyQuantity);

    if (sets === 0) {
      return [];
    }

    let freeQuantity = sets * coupon.getQuantity;
    // maxFreeQuantity limiti varsa uygula
    if (coupon.maxFreeQuantity !== null && coupon.maxFreeQuantity !== undefined) {
      freeQuantity = Math.min(freeQuantity, coupon.maxFreeQuantity);
    }
    
    const getCategoryItems = cartItems.filter(
      (item) => item.product?.categoryId === coupon.getTargetId
    );

    if (getCategoryItems.length === 0) {
      return [];
    }

    // En düşük fiyatlı ürünlerden bedava ver
    const sortedItems = [...getCategoryItems].sort((a, b) => {
      const priceA = a.product?.price || 0;
      const priceB = b.product?.price || 0;
      return priceA - priceB;
    });

    let remainingFreeQuantity = freeQuantity;

    for (const item of sortedItems) {
      if (remainingFreeQuantity <= 0) break;

      const freeFromThisItem = Math.min(remainingFreeQuantity, item.quantity);
      if (freeFromThisItem > 0 && item.productId) {
        freeItems.push({
          productId: item.productId,
          quantity: freeFromThisItem,
          price: item.product?.price || 0,
        });
        remainingFreeQuantity -= freeFromThisItem;
      }
    }
  }

  // Mod 2: İki Ürün (PRODUCT)
  if (buyMode === "PRODUCT") {
    if (!coupon.buyTargetId || !coupon.getTargetId || !coupon.buyQuantity || !coupon.getQuantity) {
      return [];
    }

    const buyProductItem = cartItems.find((item) => item.productId === coupon.buyTargetId);

    if (!buyProductItem || buyProductItem.quantity < coupon.buyQuantity) {
      return [];
    }

    const sets = Math.floor(buyProductItem.quantity / coupon.buyQuantity);

    if (sets === 0) {
      return [];
    }

    let freeQuantity = sets * coupon.getQuantity;
    // maxFreeQuantity limiti varsa uygula
    if (coupon.maxFreeQuantity !== null && coupon.maxFreeQuantity !== undefined) {
      freeQuantity = Math.min(freeQuantity, coupon.maxFreeQuantity);
    }
    
    const getProductItem = cartItems.find((item) => item.productId === coupon.getTargetId);

    if (!getProductItem || !getProductItem.productId) {
      return [];
    }

    const actualFreeQuantity = Math.min(freeQuantity, getProductItem.quantity);
    if (actualFreeQuantity > 0) {
      freeItems.push({
        productId: getProductItem.productId,
        quantity: actualFreeQuantity,
        price: getProductItem.product?.price || 0,
      });
    }
  }

  // Mod 3: Koşullu Bedava (CONDITIONAL_FREE)
  if (buyMode === "CONDITIONAL_FREE") {
    if (!coupon.getTargetId) {
      return [];
    }

    // Koşul 1: buyTargetId kategorisinden ürün var mı?
    let condition1Met = false;
    if (coupon.buyTargetId) {
      const hasBuyCategoryProduct = cartItems.some(
        (item) => item.product?.categoryId === coupon.buyTargetId
      );
      condition1Met = hasBuyCategoryProduct;
    }

    // Koşul 2: Minimum sepet tutarı üzerinde mi?
    let condition2Met = false;
    if (coupon.minimumAmount && cartSubtotal !== undefined) {
      condition2Met = cartSubtotal >= coupon.minimumAmount;
    }

    // VEYA mantığı: Her iki koşuldan biri sağlanmalı
    // Eğer buyTargetId yoksa, sadece minimumAmount kontrolü yapılır
    // Eğer minimumAmount yoksa, sadece buyTargetId kontrolü yapılır
    // İkisi de varsa, herhangi biri sağlanmalı
    const conditionMet =
      (coupon.buyTargetId && condition1Met) ||
      (coupon.minimumAmount && condition2Met);

    if (!conditionMet) {
      return [];
    }

    // getTargetId kategorisindeki TÜM ürünler bedava
    const getCategoryItems = cartItems.filter(
      (item) => item.product?.categoryId === coupon.getTargetId
    );

    // En düşük fiyatlı ürünlerden bedava ver
    const sortedItems = [...getCategoryItems].sort((a, b) => {
      const priceA = a.product?.price || 0;
      const priceB = b.product?.price || 0;
      return priceA - priceB;
    });

    // maxFreeQuantity limiti varsa uygula
    let remainingFreeQuantity: number | null = null;
    if (coupon.maxFreeQuantity !== null && coupon.maxFreeQuantity !== undefined) {
      remainingFreeQuantity = coupon.maxFreeQuantity;
    }

    for (const item of sortedItems) {
      if (item.productId && item.quantity > 0) {
        if (remainingFreeQuantity !== null) {
          // Limit varsa, limit kadar bedava ver
          if (remainingFreeQuantity <= 0) break;
          const freeFromThisItem = Math.min(remainingFreeQuantity, item.quantity);
          if (freeFromThisItem > 0) {
            freeItems.push({
              productId: item.productId,
              quantity: freeFromThisItem,
              price: item.product?.price || 0,
            });
            remainingFreeQuantity -= freeFromThisItem;
          }
        } else {
          // Limit yoksa, tüm ürünler bedava
          freeItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product?.price || 0,
          });
        }
      }
    }
  }

  return freeItems;
}

/**
 * Kupon uygulandıktan sonra toplam hesaplama
 * 
 * DOĞRU MANTIK:
 * - İndirim KDV dahil fiyata uygulanır (müşteri görünen fiyat)
 * - İndirim sonrası tutardan KDV hesaplanır
 * - Kargo ücretine KDV eklenir
 * 
 * @param cartSubtotalWithTax KDV dahil sepet toplamı (ürün fiyatları toplamı)
 * @param shippingCost KDV hariç kargo ücreti
 * @param couponDiscount Kupon indirim tutarı (KDV dahil fiyattan düşülecek)
 * @param taxRate KDV oranı
 * @param taxIncluded Fiyatlar KDV dahil mi?
 */
export function calculateTotalWithCoupon(
  cartSubtotalWithTax: number,
  shippingCost: number,
  couponDiscount: number,
  taxRate: number,
  taxIncluded: boolean
): {
  subtotal: number; // KDV hariç ara toplam (indirim sonrası)
  tax: number; // KDV tutarı (indirim sonrası)
  shippingCost: number; // KDV hariç kargo
  shippingTax: number; // Kargo KDV'si
  total: number; // Toplam (KDV dahil)
} {
  if (taxIncluded) {
    // Fiyatlar KDV dahil ise:
    // 1. İndirimi KDV dahil fiyattan düş
    const cartSubtotalAfterDiscount = Math.max(0, cartSubtotalWithTax - couponDiscount);
    
    // 2. İndirim sonrası tutardan KDV hariç tutarı hesapla
    const subtotalWithoutTax = cartSubtotalAfterDiscount / (1 + taxRate);
    
    // 3. İndirim sonrası KDV tutarını hesapla
    const productTax = cartSubtotalAfterDiscount - subtotalWithoutTax;
    
    // 4. Kargo ücretine KDV ekle
    const shippingTax = shippingCost * taxRate;
    const shippingWithTax = shippingCost + shippingTax;
    
    // 5. Toplam = indirim sonrası KDV dahil tutar + kargo (KDV dahil)
    const total = cartSubtotalAfterDiscount + shippingWithTax;
    
    return {
      subtotal: subtotalWithoutTax,
      tax: productTax + shippingTax,
      shippingCost: shippingCost,
      shippingTax: shippingTax,
      total: total,
    };
  } else {
    // Fiyatlar KDV hariç ise:
    // İndirim subtotal'dan düşülür, sonra KDV eklenir
    const discountedSubtotal = Math.max(0, cartSubtotalWithTax - couponDiscount);
    const productTax = discountedSubtotal * taxRate;
    const shippingTax = shippingCost * taxRate;
    const shippingWithTax = shippingCost + shippingTax;
    const total = discountedSubtotal + productTax + shippingWithTax;
    
    return {
      subtotal: discountedSubtotal,
      tax: productTax + shippingTax,
      shippingCost: shippingCost,
      shippingTax: shippingTax,
      total: total,
    };
  }
}
