"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCoupon, updateCoupon, getCoupon } from "@/lib/actions/coupons";
import { getAllProducts } from "@/lib/actions/admin/products";
import { getAllUsers } from "@/lib/actions/admin/users";
import { getCategoriesForAdmin } from "@/lib/actions/admin/categories";
import { toast } from "sonner";
import type { DiscountType } from "@prisma/client";
import { Percent, DollarSign, Truck, Gift, X, Search, Check } from "lucide-react";

interface CouponFormProps {
  couponId?: string;
}

const discountTypes = [
  { value: "PERCENTAGE", label: "Yüzdelik", icon: Percent, colorClass: "purple" },
  { value: "FIXED_AMOUNT", label: "Sabit Tutar", icon: DollarSign, colorClass: "blue" },
  { value: "FREE_SHIPPING", label: "Ücretsiz Kargo", icon: Truck, colorClass: "green" },
  { value: "BUY_X_GET_Y", label: "X Alana Y Bedava", icon: Gift, colorClass: "orange" },
] as const;

export default function CouponForm({ couponId }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCoupon, setLoadingCoupon] = useState(!!couponId);
  const [codeGeneration, setCodeGeneration] = useState<"custom" | "auto">("custom");
  const [selectedDiscountType, setSelectedDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [buyMode, setBuyMode] = useState<"CATEGORY" | "PRODUCT" | "CONDITIONAL_FREE" | null>(null);
  const [selectedBuyCategory, setSelectedBuyCategory] = useState<any | null>(null);
  const [selectedGetCategory, setSelectedGetCategory] = useState<any | null>(null);
  const [selectedBuyProduct, setSelectedBuyProduct] = useState<any | null>(null);
  const [selectedGetProduct, setSelectedGetProduct] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: 0,
    buyMode: null as string | null,
    buyTargetId: null as string | null,
    getTargetId: null as string | null,
    buyQuantity: null as number | null,
    getQuantity: null as number | null,
    maxFreeQuantity: 1 as number | null,
    isActive: true,
    totalUsageLimit: null as number | null,
    customerUsageLimit: 1,
    startDate: null as string | null,
    endDate: null as string | null,
    minimumAmount: null as number | null,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    applicableUsers: [] as string[],
    description: "",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  // Kupon yükle (düzenleme modu)
  useEffect(() => {
    if (couponId) {
      const loadCoupon = async () => {
        try {
          const coupon = await getCoupon(couponId);
          if (coupon) {
            setFormData({
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              buyMode: coupon.buyMode,
              buyTargetId: coupon.buyTargetId,
              getTargetId: coupon.getTargetId,
              buyQuantity: coupon.buyQuantity,
              getQuantity: coupon.getQuantity,
              maxFreeQuantity: coupon.maxFreeQuantity ?? 1,
              isActive: coupon.isActive,
              totalUsageLimit: coupon.totalUsageLimit,
              customerUsageLimit: coupon.customerUsageLimit,
              startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : null,
              endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split("T")[0] : null,
              minimumAmount: coupon.minimumAmount,
              applicableProducts: coupon.applicableProducts ? (coupon.applicableProducts as string[]) : [],
              applicableCategories: coupon.applicableCategories ? (coupon.applicableCategories as string[]) : [],
              applicableUsers: coupon.applicableUsers ? (coupon.applicableUsers as string[]) : [],
              description: coupon.description || "",
            });
            setSelectedDiscountType(coupon.discountType);
            
            // BUY_X_GET_Y için mod ve seçili öğeleri yükle
            if (coupon.discountType === "BUY_X_GET_Y" && coupon.buyMode) {
              setBuyMode(coupon.buyMode as "CATEGORY" | "PRODUCT" | "CONDITIONAL_FREE");
              
              if (coupon.buyMode === "CATEGORY" || coupon.buyMode === "CONDITIONAL_FREE") {
                // Kategorileri yükle ve seçili olanları bul
                const allCategories = await getCategoriesForAdmin();
                if (coupon.buyTargetId) {
                  const buyCat = allCategories.find((c: any) => c.id === coupon.buyTargetId);
                  setSelectedBuyCategory(buyCat || null);
                }
                if (coupon.getTargetId) {
                  const getCat = allCategories.find((c: any) => c.id === coupon.getTargetId);
                  setSelectedGetCategory(getCat || null);
                }
              } else if (coupon.buyMode === "PRODUCT") {
                // Ürünleri yükle ve seçili olanları bul
                const allProducts = await getAllProducts(1, 100, "", undefined, true);
                if (coupon.buyTargetId) {
                  const buyProd = allProducts.products.find((p: any) => p.id === coupon.buyTargetId);
                  setSelectedBuyProduct(buyProd || null);
                }
                if (coupon.getTargetId) {
                  const getProd = allProducts.products.find((p: any) => p.id === coupon.getTargetId);
                  setSelectedGetProduct(getProd || null);
                }
              }
            }
          }
        } catch (error) {
          toast.error("Kupon yüklenirken bir hata oluştu");
          router.push("/admin/kampanyalar/kuponlar");
        } finally {
          setLoadingCoupon(false);
        }
      };
      loadCoupon();
    }
  }, [couponId, router]);

  // Ürünleri yükle (BUY_X_GET_Y için gerekli, özellikle İki Ürün Modu için)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        // Tüm ürünleri yükle (limit yüksek tutulabilir veya sayfalama yapılabilir)
        const result = await getAllProducts(1, 1000, "", undefined, true);
        setProducts(result.products);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Ürünler yüklenirken bir hata oluştu");
      } finally {
        setProductsLoading(false);
      }
    };
    // Her zaman yükle, çünkü İki Ürün Modu için gerekli
      loadProducts();
  }, []);

  // Kategorileri yükle (her zaman yükle, çünkü BUY_X_GET_Y için gerekli)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const result = await getCategoriesForAdmin();
        setCategories(result);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Kategoriler yüklenirken bir hata oluştu");
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Kullanıcıları yükle
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await getAllUsers(1, 100, userSearch, "user");
        setUsers(result.users);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    if (showUserSelector) {
      loadUsers();
    }
  }, [showUserSelector, userSearch]);

  // Seçili ürünleri yükle
  useEffect(() => {
    if (formData.applicableProducts.length > 0 && products.length > 0) {
      const selected = products.filter((p) => formData.applicableProducts.includes(p.id));
      setSelectedProducts(selected);
    }
  }, [formData.applicableProducts, products]);

  // Seçili kategorileri yükle
  useEffect(() => {
    if (formData.applicableCategories.length > 0 && categories.length > 0) {
      const selected = categories.filter((c) => formData.applicableCategories.includes(c.id));
      setSelectedCategories(selected);
    }
  }, [formData.applicableCategories, categories]);

  // Seçili kullanıcıları yükle
  useEffect(() => {
    if (formData.applicableUsers.length > 0 && users.length > 0) {
      const selected = users.filter((u) => formData.applicableUsers.includes(u.id));
      setSelectedUsers(selected);
    }
  }, [formData.applicableUsers, users]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // BUY_X_GET_Y için validasyon
      if (selectedDiscountType === "BUY_X_GET_Y") {
        if (!buyMode) {
          toast.error("Lütfen bir mod seçin");
          setLoading(false);
          return;
        }

        if (buyMode === "CATEGORY" || buyMode === "PRODUCT") {
          if (!formData.buyTargetId || !formData.getTargetId || !formData.buyQuantity || !formData.getQuantity) {
            toast.error("Lütfen tüm alanları doldurun");
            setLoading(false);
            return;
          }
          if (formData.buyTargetId === formData.getTargetId) {
            toast.error("Alınacak ve bedava hedef aynı olamaz");
            setLoading(false);
            return;
          }
        }

        if (buyMode === "CONDITIONAL_FREE") {
          if (!formData.getTargetId) {
            toast.error("Bedava kategori seçilmelidir");
            setLoading(false);
            return;
          }
          if (!formData.buyTargetId && !formData.minimumAmount) {
            toast.error("En az bir koşul belirtilmelidir (kategori veya minimum tutar)");
            setLoading(false);
            return;
          }
        }
      }

      const data = {
        ...formData,
        code: codeGeneration === "auto" ? generateCode() : formData.code.toUpperCase(),
        discountType: selectedDiscountType,
        buyMode: selectedDiscountType === "BUY_X_GET_Y" ? buyMode : null,
        buyTargetId: selectedDiscountType === "BUY_X_GET_Y" ? formData.buyTargetId : null,
        getTargetId: selectedDiscountType === "BUY_X_GET_Y" ? formData.getTargetId : null,
        buyQuantity: selectedDiscountType === "BUY_X_GET_Y" && (buyMode === "CATEGORY" || buyMode === "PRODUCT") ? formData.buyQuantity : null,
        getQuantity: selectedDiscountType === "BUY_X_GET_Y" && (buyMode === "CATEGORY" || buyMode === "PRODUCT") ? formData.getQuantity : null,
        maxFreeQuantity: selectedDiscountType === "BUY_X_GET_Y" ? formData.maxFreeQuantity : null,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        applicableProducts: formData.applicableProducts.length > 0 ? formData.applicableProducts : null,
        applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : null,
        applicableUsers: formData.applicableUsers.length > 0 ? formData.applicableUsers : null,
      };

      if (couponId) {
        await updateCoupon(couponId, data);
        toast.success("Kupon başarıyla güncellendi");
      } else {
        await createCoupon(data);
        toast.success("Kupon başarıyla oluşturuldu");
      }

      router.push("/admin/kampanyalar/kuponlar");
    } catch (error: any) {
      toast.error(error.message || "Kupon kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const isSelected = formData.applicableProducts.includes(productId);
    setFormData({
      ...formData,
      applicableProducts: isSelected
        ? formData.applicableProducts.filter((id) => id !== productId)
        : [...formData.applicableProducts, productId],
    });
  };

  const toggleUser = (userId: string) => {
    const isSelected = formData.applicableUsers.includes(userId);
    setFormData({
      ...formData,
      applicableUsers: isSelected
        ? formData.applicableUsers.filter((id) => id !== userId)
        : [...formData.applicableUsers, userId],
    });
  };

  const removeProduct = (productId: string) => {
    setFormData({
      ...formData,
      applicableProducts: formData.applicableProducts.filter((id) => id !== productId),
    });
  };

  const toggleCategory = (categoryId: string) => {
    const isSelected = formData.applicableCategories.includes(categoryId);
    setFormData({
      ...formData,
      applicableCategories: isSelected
        ? formData.applicableCategories.filter((id) => id !== categoryId)
        : [...formData.applicableCategories, categoryId],
    });
  };

  const removeCategory = (categoryId: string) => {
    setFormData({
      ...formData,
      applicableCategories: formData.applicableCategories.filter((id) => id !== categoryId),
    });
  };

  const removeUser = (userId: string) => {
    setFormData({
      ...formData,
      applicableUsers: formData.applicableUsers.filter((id) => id !== userId),
    });
  };

  if (loadingCoupon) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-sm font-sans text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-gray-900">
          {couponId ? "Kupon Düzenle" : "Kupon Ekle"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kupon Kodu */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <h2 className="text-lg font-sans font-semibold text-gray-900">Kupon Kodu</h2>
          
          <div className="space-y-3">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="codeType"
                  value="custom"
                  checked={codeGeneration === "custom"}
                  onChange={() => setCodeGeneration("custom")}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="font-sans text-sm text-gray-700">Özel Kupon</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="codeType"
                  value="auto"
                  checked={codeGeneration === "auto"}
                  onChange={() => setCodeGeneration("auto")}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="font-sans text-sm text-gray-700">Otomatik Kod Üret</span>
              </label>
            </div>

            {codeGeneration === "custom" && (
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Kod <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
                  placeholder="HOŞGELDİN10"
                />
                <p className="mt-1 text-xs font-sans text-gray-500">
                  Müşteriler bu indirim kodunu ödeme sırasında gireceklerdir.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* İndirim Türü */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <h2 className="text-lg font-sans font-semibold text-gray-900">İndirim Türü</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {discountTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedDiscountType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelectedDiscountType(type.value as DiscountType);
                    setFormData({ ...formData, discountType: type.value as DiscountType });
                    if (type.value !== "BUY_X_GET_Y") {
                      setBuyMode(null);
                      setFormData({
                        ...formData,
                        discountType: type.value as DiscountType,
                        buyMode: null,
                        buyTargetId: null,
                        getTargetId: null,
                        buyQuantity: null,
                        getQuantity: null,
                        maxFreeQuantity: null,
                      });
                    }
                  }}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? type.colorClass === "purple"
                        ? "border-purple-500 bg-purple-50"
                        : type.colorClass === "blue"
                        ? "border-blue-500 bg-blue-50"
                        : type.colorClass === "green"
                        ? "border-green-500 bg-green-50"
                        : "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                        type.colorClass === "purple"
                          ? "bg-purple-500"
                          : type.colorClass === "blue"
                          ? "bg-blue-500"
                          : type.colorClass === "green"
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      type.colorClass === "purple"
                        ? "bg-purple-100"
                        : type.colorClass === "blue"
                        ? "bg-blue-100"
                        : type.colorClass === "green"
                        ? "bg-green-100"
                        : "bg-orange-100"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        type.colorClass === "purple"
                          ? "text-purple-600"
                          : type.colorClass === "blue"
                          ? "text-blue-600"
                          : type.colorClass === "green"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    />
                  </div>
                  <p className="text-sm font-sans font-medium text-gray-900 text-center">{type.label}</p>
                </button>
              );
            })}
          </div>

          {/* İndirim Değeri */}
          {(selectedDiscountType === "PERCENTAGE" || selectedDiscountType === "FIXED_AMOUNT") && (
            <div className="mt-4">
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                İndirim Değeri <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {selectedDiscountType === "PERCENTAGE" ? (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                ) : (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₺</span>
                )}
                <input
                  type="number"
                  required
                  min="0"
                  max={selectedDiscountType === "PERCENTAGE" ? 100 : undefined}
                  step={selectedDiscountType === "PERCENTAGE" ? "0.01" : "0.01"}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
                  placeholder={selectedDiscountType === "PERCENTAGE" ? "10" : "50.00"}
                />
              </div>
            </div>
          )}

          {/* BUY_X_GET_Y için mod seçimi ve özel alanlar */}
          {selectedDiscountType === "BUY_X_GET_Y" && (
            <div className="mt-4 space-y-6">
              {/* Mod Seçimi */}
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-3">
                  Kupon Modu <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setBuyMode("CATEGORY");
                      setFormData({
                        ...formData,
                        buyMode: "CATEGORY",
                        buyTargetId: null,
                        getTargetId: null,
                        buyQuantity: null,
                        getQuantity: null,
                        maxFreeQuantity: 1,
                      });
                      setSelectedBuyCategory(null);
                      setSelectedGetCategory(null);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      buyMode === "CATEGORY"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-sans font-semibold text-gray-900 mb-1">İki Kategori</div>
                    <div className="text-xs font-sans text-gray-600">
                      X kategorisinden N adet alındığında, Y kategorisinden M adet bedava
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBuyMode("PRODUCT");
                      setFormData({
                        ...formData,
                        buyMode: "PRODUCT",
                        buyTargetId: null,
                        getTargetId: null,
                        buyQuantity: null,
                        getQuantity: null,
                        maxFreeQuantity: 1,
                      });
                      setSelectedBuyProduct(null);
                      setSelectedGetProduct(null);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      buyMode === "PRODUCT"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-sans font-semibold text-gray-900 mb-1">İki Ürün</div>
                    <div className="text-xs font-sans text-gray-600">
                      X ürününden N adet alındığında, Y ürününden M adet bedava
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBuyMode("CONDITIONAL_FREE");
                      setFormData({
                        ...formData,
                        buyMode: "CONDITIONAL_FREE",
                        buyTargetId: null,
                        getTargetId: null,
                        buyQuantity: null,
                        getQuantity: null,
                        maxFreeQuantity: 1,
                      });
                      setSelectedBuyCategory(null);
                      setSelectedGetCategory(null);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      buyMode === "CONDITIONAL_FREE"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-sans font-semibold text-gray-900 mb-1">Koşullu Bedava</div>
                    <div className="text-xs font-sans text-gray-600">
                      X kategorisinden ürün alırsan VEYA minimum tutar üzerindeyse → Y kategorisindeki tüm ürünler bedava
                    </div>
                  </button>
                </div>
              </div>

              {/* İki Kategori Modu */}
              {buyMode === "CATEGORY" && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="text-base font-sans font-semibold text-gray-900">İki Kategori Modu</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Alınacak Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.buyTargetId || ""}
                        onChange={(e) => {
                          const category = categories.find((c: any) => c.id === e.target.value);
                          setSelectedBuyCategory(category || null);
                          setFormData({ ...formData, buyTargetId: e.target.value || null });
                        }}
                        disabled={categoriesLoading || categories.length === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{categoriesLoading ? "Kategoriler yükleniyor..." : categories.length === 0 ? "Kategori bulunamadı" : "Kategori Seçin"}</option>
                        {categories.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Alınacak Adet (N) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.buyQuantity || ""}
                        onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                        placeholder="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Bedava Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.getTargetId || ""}
                        onChange={(e) => {
                          const category = categories.find((c: any) => c.id === e.target.value);
                          setSelectedGetCategory(category || null);
                          setFormData({ ...formData, getTargetId: e.target.value || null });
                        }}
                        disabled={categoriesLoading || categories.length === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{categoriesLoading ? "Kategoriler yükleniyor..." : categories.length === 0 ? "Kategori bulunamadı" : "Kategori Seçin"}</option>
                        {categories.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Bedava Adet (M) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.getQuantity || ""}
                        onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Maksimum Bedava Ürün Limiti (Opsiyonel)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxFreeQuantity || ""}
                      onChange={(e) => setFormData({ ...formData, maxFreeQuantity: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                      placeholder="Sınırsız (boş bırakın)"
                    />
                    <p className="mt-1 text-xs font-sans text-gray-500">
                      Alınan ürün sayısı arttıkça bedava ürün sayısının da artmasını engellemek için limit belirleyin. Örn: 1 (sadece 1 bedava ürün)
                    </p>
                  </div>

                  <p className="text-sm font-sans text-gray-600 bg-white p-3 rounded border border-gray-200">
                    <strong>Açıklama:</strong> {selectedBuyCategory?.name || "X"} kategorisinden {formData.buyQuantity || "N"} adet alındığında, {selectedGetCategory?.name || "Y"} kategorisinden {formData.getQuantity || "M"} adet bedava{formData.maxFreeQuantity ? ` (maksimum ${formData.maxFreeQuantity} adet)` : ""}
                  </p>
                </div>
              )}

              {/* İki Ürün Modu */}
              {buyMode === "PRODUCT" && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="text-base font-sans font-semibold text-gray-900">İki Ürün Modu</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Alınacak Ürün <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.buyTargetId || ""}
                        onChange={(e) => {
                          const product = products.find((p: any) => p.id === e.target.value);
                          setSelectedBuyProduct(product || null);
                          setFormData({ ...formData, buyTargetId: e.target.value || null });
                        }}
                        disabled={productsLoading || products.length === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{productsLoading ? "Ürünler yükleniyor..." : products.length === 0 ? "Ürün bulunamadı" : "Ürün Seçin"}</option>
                        {products.map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.price.toLocaleString("tr-TR")} ₺
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Alınacak Adet (N) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.buyQuantity || ""}
                        onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                        placeholder="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Bedava Ürün <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.getTargetId || ""}
                        onChange={(e) => {
                          const product = products.find((p: any) => p.id === e.target.value);
                          setSelectedGetProduct(product || null);
                          setFormData({ ...formData, getTargetId: e.target.value || null });
                        }}
                        disabled={productsLoading || products.length === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{productsLoading ? "Ürünler yükleniyor..." : products.length === 0 ? "Ürün bulunamadı" : "Ürün Seçin"}</option>
                        {products.map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.price.toLocaleString("tr-TR")} ₺
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Bedava Adet (M) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.getQuantity || ""}
                        onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Maksimum Bedava Ürün Limiti (Opsiyonel)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxFreeQuantity || ""}
                      onChange={(e) => setFormData({ ...formData, maxFreeQuantity: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                      placeholder="Sınırsız (boş bırakın)"
                    />
                    <p className="mt-1 text-xs font-sans text-gray-500">
                      Alınan ürün sayısı arttıkça bedava ürün sayısının da artmasını engellemek için limit belirleyin. Örn: 1 (sadece 1 bedava ürün)
                    </p>
                  </div>

                  <p className="text-sm font-sans text-gray-600 bg-white p-3 rounded border border-gray-200">
                    <strong>Açıklama:</strong> {selectedBuyProduct?.name || "X ürünü"} ürününden {formData.buyQuantity || "N"} adet alındığında, {selectedGetProduct?.name || "Y ürünü"} ürününden {formData.getQuantity || "M"} adet bedava{formData.maxFreeQuantity ? ` (maksimum ${formData.maxFreeQuantity} adet)` : ""}
                  </p>
                </div>
              )}

              {/* Koşullu Bedava Modu */}
              {buyMode === "CONDITIONAL_FREE" && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="text-base font-sans font-semibold text-gray-900">Koşullu Bedava Modu</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Koşul 1: Alınacak Kategori (Opsiyonel)
                      </label>
                      <select
                        value={formData.buyTargetId || ""}
                        onChange={(e) => {
                          const category = categories.find((c: any) => c.id === e.target.value);
                          setSelectedBuyCategory(category || null);
                          setFormData({ ...formData, buyTargetId: e.target.value || null });
                        }}
                        disabled={categories.length === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{categories.length === 0 ? "Kategoriler yükleniyor..." : "Kategori Seçin (Opsiyonel)"}</option>
                        {categories.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs font-sans text-gray-500">
                        Bu kategoriden ürün alındığında koşul sağlanır
                      </p>
                    </div>

                    <div className="text-center font-sans text-gray-600 font-semibold">VEYA</div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Koşul 2: Minimum Sepet Tutarı (Opsiyonel)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₺</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.minimumAmount || ""}
                          onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                          placeholder="Minimum tutar"
                        />
                      </div>
                      <p className="mt-1 text-xs font-sans text-gray-500">
                        Sepet tutarı bu değerin üzerindeyse koşul sağlanır
                      </p>
                    </div>

                    <div className="border-t border-orange-300 pt-4">
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Bedava Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.getTargetId || ""}
                        onChange={(e) => {
                          const category = categories.find((c: any) => c.id === e.target.value);
                          setSelectedGetCategory(category || null);
                          setFormData({ ...formData, getTargetId: e.target.value || null });
                        }}
                        disabled={categoriesLoading || categories.length === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{categoriesLoading ? "Kategoriler yükleniyor..." : categories.length === 0 ? "Kategori bulunamadı" : "Kategori Seçin"}</option>
                        {categories.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                        Maksimum Bedava Ürün Limiti (Opsiyonel)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxFreeQuantity || ""}
                        onChange={(e) => setFormData({ ...formData, maxFreeQuantity: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans text-gray-900"
                        placeholder="Sınırsız (boş bırakın)"
                      />
                      <p className="mt-1 text-xs font-sans text-gray-500">
                        Koşul sağlandığında bedava verilecek maksimum ürün sayısını sınırlandırın. Örn: 1 (sadece 1 bedava ürün)
                      </p>
                    </div>

                    <p className="text-sm font-sans text-gray-600 bg-white p-3 rounded border border-gray-200">
                      <strong>Açıklama:</strong> {formData.buyTargetId ? `"${selectedBuyCategory?.name || "X"}" kategorisinden ürün alındığında` : ""} {formData.buyTargetId && formData.minimumAmount ? "VEYA " : ""} {formData.minimumAmount ? `sepet tutarı ${formData.minimumAmount.toLocaleString("tr-TR")} TL üzerindeyse` : ""} → {selectedGetCategory?.name || "Y"} kategorisindeki <strong>tüm ürünler bedava</strong>{formData.maxFreeQuantity ? ` (maksimum ${formData.maxFreeQuantity} adet)` : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Limitler */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <h2 className="text-lg font-sans font-semibold text-gray-900">Limitler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Toplam Limit
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalUsageLimit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalUsageLimit: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
                placeholder="Sınırsız"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Müşteri Başına Kullanım Limiti <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.customerUsageLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerUsageLimit: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Tarih Aralığı */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <h2 className="text-lg font-sans font-semibold text-gray-900">Tarih Aralığı</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
                min={formData.startDate || undefined}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Minimum Tutar */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <h2 className="text-lg font-sans font-semibold text-gray-900">Minimum Tutar</h2>
          
          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              Minimum Sepet Tutarı
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₺</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minimumAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumAmount: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
                placeholder="Minimum tutar yok"
              />
            </div>
          </div>
        </div>

        {/* Ürün Seçimi */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-sans font-semibold text-gray-900">Ürün Seçimi (Opsiyonel)</h2>
            <button
              type="button"
              onClick={() => setShowProductSelector(!showProductSelector)}
              className="text-sm font-sans text-purple-600 hover:text-purple-700"
            >
              {showProductSelector ? "Kapat" : "Ürün Seç"}
            </button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <span
                  key={product.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-sans"
                >
                  {product.name}
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {showProductSelector && (
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-sm text-gray-900"
                />
              </div>
              <div className="space-y-2">
                {products.map((product) => {
                  const isSelected = formData.applicableProducts.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm font-sans text-gray-900">{product.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Kategori Seçimi (BUY_X_GET_Y için özellikle önemli) */}
        {(selectedDiscountType === "BUY_X_GET_Y" || formData.applicableCategories.length > 0) && (
          <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-sans font-semibold text-gray-900">
                Kategori Seçimi (Opsiyonel)
                {selectedDiscountType === "BUY_X_GET_Y" && (
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (Boş bırakılırsa tüm kategorilere uygulanır)
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setShowCategorySelector(!showCategorySelector)}
                className="text-sm font-sans text-orange-600 hover:text-orange-700"
              >
                {showCategorySelector ? "Kapat" : "Kategori Seç"}
              </button>
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-sans"
                  >
                    {category.name}
                    <button
                      type="button"
                      onClick={() => removeCategory(category.id)}
                      className="hover:text-orange-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showCategorySelector && (
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {categories.map((category) => {
                    const isSelected = formData.applicableCategories.includes(category.id);
                    return (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCategory(category.id)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <span className="text-sm font-sans text-gray-900">{category.name}</span>
                        <span className="text-xs text-gray-500 font-sans">
                          ({category._count?.products || 0} ürün)
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Müşteri Seçimi */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-sans font-semibold text-gray-900">Müşteri Seçimi (Opsiyonel)</h2>
            <button
              type="button"
              onClick={() => setShowUserSelector(!showUserSelector)}
              className="text-sm font-sans text-purple-600 hover:text-purple-700"
            >
              {showUserSelector ? "Kapat" : "Müşteri Seç"}
            </button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-sans"
                >
                  {user.name || user.email}
                  <button
                    type="button"
                    onClick={() => removeUser(user.id)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {showUserSelector && (
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Müşteri ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-sm text-gray-900"
                />
              </div>
              <div className="space-y-2">
                {users.map((user) => {
                  const isSelected = formData.applicableUsers.includes(user.id);
                  return (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-sans text-gray-900">
                        {user.name || user.email}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Açıklama */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <h2 className="text-lg font-sans font-semibold text-gray-900">Açıklama</h2>
          
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
            placeholder="Kupon açıklaması (opsiyonel)"
          />
        </div>

        {/* Durum */}
        <div className="bg-white border border-gray-300 rounded-sm p-6 space-y-4">
          <h2 className="text-lg font-sans font-semibold text-gray-900">Durum</h2>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="font-sans text-sm text-gray-700">Kupon aktif</span>
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/kampanyalar/kuponlar")}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sans text-sm font-medium text-gray-700"
          >
            İptal Et
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-sans text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Kaydediliyor..." : couponId ? "Güncelle" : "Yeni Kupon Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}
