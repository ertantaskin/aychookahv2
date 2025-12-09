"use client";

// Guest sepet için localStorage key
const CART_STORAGE_KEY = "aychookah_guest_cart";

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

// Guest sepeti getir
export const getGuestCart = (): GuestCartItem[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

// Guest sepete ürün ekle
export const addToGuestCart = (productId: string, quantity: number = 1): GuestCartItem[] => {
  if (typeof window === "undefined") return [];
  
  const cart = getGuestCart();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

// Guest sepetten ürün çıkar
export const removeFromGuestCart = (productId: string): GuestCartItem[] => {
  if (typeof window === "undefined") return [];
  
  const cart = getGuestCart().filter(item => item.productId !== productId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

// Guest sepet kalemi miktarını güncelle
export const updateGuestCartItemQuantity = (productId: string, quantity: number): GuestCartItem[] => {
  if (typeof window === "undefined") return [];
  
  if (quantity <= 0) {
    return removeFromGuestCart(productId);
  }
  
  const cart = getGuestCart();
  const item = cart.find(item => item.productId === productId);
  
  if (item) {
    item.quantity = quantity;
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

// Guest sepeti temizle
export const clearGuestCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
};

// Guest sepet toplam ürün sayısı
export const getGuestCartItemCount = (): number => {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

