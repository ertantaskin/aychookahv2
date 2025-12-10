"use client";

interface ProductSalesItem {
  productId: string | null;
  productName: string;
  categoryName: string;
  totalQuantity: number;
  netRevenue: number;
}

interface ProductSalesTableProps {
  data: ProductSalesItem[];
}

export default function ProductSalesTable({ data }: ProductSalesTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-6">
        <p className="text-sm font-sans text-gray-500 text-center">Bu tarih aralığında satış verisi bulunamadı.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Ürün Başlığı
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-4 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Satılan Adet
              </th>
              <th className="px-4 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Net Satış Tutarı
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.productId || `unknown-${index}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-sans text-gray-900">
                  {item.productName}
                </td>
                <td className="px-4 py-3 text-sm font-sans text-gray-600">
                  {item.categoryName}
                </td>
                <td className="px-4 py-3 text-sm font-sans text-gray-900 text-right">
                  {item.totalQuantity.toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-3 text-sm font-sans font-medium text-gray-900 text-right">
                  {formatCurrency(item.netRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

