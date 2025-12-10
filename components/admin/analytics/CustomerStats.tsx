"use client";

interface TopCustomer {
  customerId: string;
  customerName: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomerStatsData {
  totalCustomers: number;
  newCustomerCount: number;
  returningCustomerCount: number;
  topCustomers: TopCustomer[];
}

interface CustomerStatsProps {
  data: CustomerStatsData;
}

export default function CustomerStats({ data }: CustomerStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-300 rounded-sm p-4">
          <div className="text-sm font-sans text-gray-600 mb-1">Toplam Müşteri</div>
          <div className="text-2xl font-sans font-semibold text-gray-900">
            {data.totalCustomers.toLocaleString("tr-TR")}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-sm p-4">
          <div className="text-sm font-sans text-gray-600 mb-1">Yeni Müşteriler</div>
          <div className="text-2xl font-sans font-semibold text-green-600">
            {data.newCustomerCount.toLocaleString("tr-TR")}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-sm p-4">
          <div className="text-sm font-sans text-gray-600 mb-1">Tekrar Eden Müşteriler</div>
          <div className="text-2xl font-sans font-semibold text-blue-600">
            {data.returningCustomerCount.toLocaleString("tr-TR")}
          </div>
        </div>
      </div>

      {/* En Çok Harcama Yapan Müşteriler */}
      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-sans font-semibold text-gray-900">En Çok Harcama Yapan Müşteriler</h3>
        </div>
        {data.topCustomers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-sans text-gray-500">Bu tarih aralığında müşteri verisi bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Sipariş Sayısı
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Toplam Harcama
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topCustomers.map((customer, index) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-sans text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                          {index + 1}
                        </span>
                        {customer.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm font-sans text-gray-600">
                      {customer.email}
                    </td>
                    <td className="px-6 py-3 text-sm font-sans text-gray-900 text-right">
                      {customer.orderCount.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-3 text-sm font-sans font-medium text-gray-900 text-right">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

