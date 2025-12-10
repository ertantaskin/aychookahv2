"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  FileText,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Save,
  X,
  Clock,
  History,
} from "lucide-react";
import { updateOrderStatus, updatePaymentStatus, updateOrderNotes } from "@/lib/actions/admin/orders";
import { toast } from "sonner";

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    paymentStatus: string;
    paymentMethod: string | null;
    paymentId: string | null;
    notes: string | null;
    shippingAddress: any;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      productName: string | null;
      productImageUrl: string | null;
      product: {
        id: string;
        name: string;
        slug: string;
        images: Array<{ url: string }>;
      } | null;
    }>;
    user: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
    };
    logs?: Array<{
      id: string;
      action: string;
      field: string | null;
      oldValue: string | null;
      newValue: string | null;
      description: string;
      changedBy: string | null;
      changedByName: string | null;
      createdAt: Date;
    }>;
  };
}

const statusOptions = [
  { value: "PENDING", label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Onaylandı", color: "bg-blue-100 text-blue-800" },
  { value: "PROCESSING", label: "Hazırlanıyor", color: "bg-purple-100 text-purple-800" },
  { value: "SHIPPED", label: "Kargoda", color: "bg-indigo-100 text-indigo-800" },
  { value: "DELIVERED", label: "Teslim Edildi", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "İptal Edildi", color: "bg-red-100 text-red-800" },
  { value: "REFUNDED", label: "İade Edildi", color: "bg-gray-100 text-gray-800" },
];

const paymentStatusOptions = [
  { value: "PENDING", label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
  { value: "COMPLETED", label: "Tamamlandı", color: "bg-green-100 text-green-800" },
  { value: "FAILED", label: "Başarısız", color: "bg-red-100 text-red-800" },
  { value: "REFUNDED", label: "İade Edildi", color: "bg-gray-100 text-gray-800" },
];

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [notes, setNotes] = useState(order.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

  const currentStatusOption = statusOptions.find((opt) => opt.value === status);
  const currentPaymentStatusOption = paymentStatusOptions.find((opt) => opt.value === paymentStatus);

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, status);
      toast.success("Sipariş durumu güncellendi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Durum güncellenirken bir hata oluştu");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentStatusUpdate = async () => {
    setIsUpdatingPaymentStatus(true);
    try {
      await updatePaymentStatus(order.id, paymentStatus);
      toast.success("Ödeme durumu güncellendi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Ödeme durumu güncellenirken bir hata oluştu");
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  const handleNotesUpdate = async () => {
    setIsUpdatingNotes(true);
    try {
      await updateOrderNotes(order.id, notes.trim() || null);
      toast.success("Notlar güncellendi");
      setIsEditingNotes(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Notlar güncellenirken bir hata oluştu");
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-sans font-bold text-gray-900 mb-2">Sipariş Detayı</h1>
            <p className="text-sm font-sans text-gray-600">Sipariş No: {order.orderNumber}</p>
          </div>
        <button
          onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            Geri
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Bilgileri */}
            <div className="bg-white border border-gray-300 rounded-sm p-6">
              <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sipariş Bilgileri
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                      Sipariş Durumu
                    </label>
                    <div className="flex items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm font-sans text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                          <option key={option.value} value={option.value} className="font-sans text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
                      <button
                        onClick={handleStatusUpdate}
                        disabled={isUpdatingStatus || status === order.status}
                        className="px-4 py-2 text-sm font-sans bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUpdatingStatus ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Güncelleniyor...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Kaydet
                          </>
                        )}
                      </button>
                    </div>
                    {currentStatusOption && (
                      <span
                        className={`inline-flex mt-2 px-2 py-1 text-xs font-sans font-medium rounded-full ${currentStatusOption.color}`}
                      >
                        {currentStatusOption.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                      Tarih
                    </label>
                    <div className="flex items-center gap-2 text-sm font-sans text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {format(new Date(order.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
                    </div>
                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                      <p className="text-xs font-sans text-gray-500 mt-1">
                        Son güncelleme: {format(new Date(order.updatedAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ödeme Bilgileri */}
            <div className="bg-white border border-gray-300 rounded-sm p-6">
              <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Ödeme Bilgileri
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                      Ödeme Durumu
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm font-sans text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {paymentStatusOptions.map((option) => (
                          <option key={option.value} value={option.value} className="font-sans text-gray-900">
                            {option.label}
                          </option>
                        ))}
                      </select>
              <button
                        onClick={handlePaymentStatusUpdate}
                        disabled={isUpdatingPaymentStatus || paymentStatus === order.paymentStatus}
                        className="px-4 py-2 text-sm font-sans bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                        {isUpdatingPaymentStatus ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Güncelleniyor...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Kaydet
                          </>
                        )}
              </button>
            </div>
                    {currentPaymentStatusOption && (
                      <span
                        className={`inline-flex mt-2 px-2 py-1 text-xs font-sans font-medium rounded-full ${currentPaymentStatusOption.color}`}
                      >
                        {currentPaymentStatusOption.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                      Ödeme Yöntemi
                    </label>
                    <p className="text-sm font-sans text-gray-900">
                      {order.paymentMethod || "Belirtilmemiş"}
                    </p>
                    {order.paymentId && (
                      <p className="text-xs font-sans text-gray-500 mt-1">ID: {order.paymentId}</p>
                    )}
                  </div>
                </div>
              </div>
          </div>

          {/* Sipariş Kalemleri */}
            <div className="bg-white border border-gray-300 rounded-sm p-6">
              <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4">Sipariş Kalemleri</h2>
            <div className="space-y-4">
              {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {(item.product?.images?.[0]?.url || item.productImageUrl) ? (
                      <Image
                        src={item.product?.images[0]?.url || item.productImageUrl || ""}
                        alt={item.product?.name || item.productName || "Ürün"}
                        fill
                        className="object-cover"
                          sizes="80px"
                      />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-sans">
                        Görsel Yok
                      </div>
                    )}
                  </div>
                    <div className="flex-1 min-w-0">
                      {item.product?.slug ? (
                        <Link
                          href={`/urun/${item.product.slug}`}
                          className="font-sans font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                        >
                          {item.product.name || item.productName || "Silinmiş Ürün"}
                        </Link>
                      ) : (
                        <h3 className="font-sans font-semibold text-gray-900 block truncate">
                      {item.product?.name || item.productName || "Silinmiş Ürün"}
                    </h3>
                      )}
                      <p className="text-sm font-sans text-gray-600 mt-1">
                        Adet: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                  </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-sans font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teslimat Adresi */}
            <div className="bg-white border border-gray-300 rounded-sm p-6">
              <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Teslimat Adresi
              </h2>
              <div className="space-y-2 font-sans text-gray-700">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.district} / {order.shippingAddress?.city}
              </p>
              <p>{order.shippingAddress?.postalCode}</p>
                {order.shippingAddress?.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`tel:${order.shippingAddress.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {order.shippingAddress.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-white border border-gray-300 rounded-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-sans font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notlar
                </h2>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-sans text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Düzenle
                  </button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm font-sans text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sipariş notlarını buraya yazın..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNotesUpdate}
                      disabled={isUpdatingNotes}
                      className="px-4 py-2 text-sm font-sans bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUpdatingNotes ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Kaydet
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setNotes(order.notes || "");
                        setIsEditingNotes(false);
                      }}
                      disabled={isUpdatingNotes}
                      className="px-4 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-sans text-gray-700 whitespace-pre-wrap">
                  {notes || "Henüz not eklenmemiş."}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Müşteri Bilgileri */}
            <div className="bg-white border border-gray-300 rounded-sm p-6">
              <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Müşteri Bilgileri
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <p className="text-sm font-sans text-gray-900">
                    {order.user.name || "Belirtilmemiş"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <a
                    href={`mailto:${order.user.email}`}
                    className="text-sm font-sans text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {order.user.email}
                  </a>
                </div>
                {order.user.phone && (
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <a
                      href={`tel:${order.user.phone}`}
                      className="text-sm font-sans text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {order.user.phone}
                    </a>
        </div>
                )}
              </div>
            </div>

            {/* Sipariş Özeti */}
            <div className="bg-white border border-gray-300 rounded-sm p-6 sticky top-24">
              <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-sans">
                <span className="text-gray-600">Ara Toplam:</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
                <div className="flex justify-between text-sm font-sans">
                <span className="text-gray-600">KDV:</span>
                  <span className="text-gray-900">{formatCurrency(order.tax)}</span>
              </div>
                <div className="flex justify-between text-sm font-sans">
                <span className="text-gray-600">Kargo:</span>
                  <span className="text-gray-900">{formatCurrency(order.shippingCost)}</span>
              </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-sans font-bold text-gray-900">
                <span>Toplam:</span>
                  <span>{formatCurrency(order.total)}</span>
              </div>
              </div>
            </div>

            {/* Sipariş Logları */}
            <div className="bg-white border border-gray-300 rounded-sm p-4">
              <h2 className="text-base font-sans font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Sipariş Geçmişi
              </h2>
              {order.logs && order.logs.length > 0 ? (
                <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                  {order.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 pb-2 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <Clock className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans text-gray-900 leading-relaxed">{log.description}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {log.changedByName && (
                            <>
                              <span className="text-xs font-sans text-gray-500 font-medium">
                                {log.changedByName}
                              </span>
                              <span className="text-xs font-sans text-gray-400">•</span>
                            </>
                          )}
                          <span className="text-xs font-sans text-gray-500">
                            {format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                          </span>
                        </div>
                        {log.oldValue && log.newValue && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-sans">
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded line-through text-xs">
                              {log.oldValue}
                            </span>
                            <span className="text-gray-400 text-xs">→</span>
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                              {log.newValue}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-sans text-gray-500">
                    Henüz sipariş geçmişi kaydı bulunmuyor.
                  </p>
                  <p className="text-xs font-sans text-gray-400 mt-1">
                    Sipariş durumu, ödeme durumu veya notlar değiştirildiğinde burada görünecektir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
