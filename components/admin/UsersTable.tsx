"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllUsers } from "@/lib/actions/admin/users";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: Date;
  _count: {
    orders: number;
  };
}

export default function UsersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filtreler
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(20);

  // Kullanıcıları yükle
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllUsers(
        page,
        limit,
        search || undefined,
        role === "all" ? undefined : role,
        sortBy,
        sortOrder
      );
      setUsers(result.users);
      setTotal(result.total);
      setTotalPages(result.totalPages);

      // URL'i güncelle
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role !== "all") params.set("role", role);
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
      if (page > 1) params.set("page", page.toString());

      router.replace(`/admin/kullanicilar?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, role, sortBy, sortOrder, router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === "role") setRole(value);
    if (filter === "sortBy") setSortBy(value);
    if (filter === "sortOrder") setSortOrder(value as "asc" | "desc");
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setRole("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters = search || role !== "all" || sortBy !== "createdAt";

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-sans font-semibold text-gray-900">Kullanıcılar</h1>
          <p className="text-sm font-sans text-gray-500 mt-1">
            Toplam {total} kullanıcı
          </p>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="İsim, email veya telefon ara..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Rol Filtresi */}
            <div>
              <select
                value={role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">Tüm Roller</option>
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Sıralama */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="createdAt-desc">Yeni → Eski</option>
                <option value="createdAt-asc">Eski → Yeni</option>
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Aktif Filtreler */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-sans font-medium text-gray-500">Aktif Filtreler:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Arama: {search}
                  <button
                    onClick={() => handleSearch("")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {role !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Rol: {role === "user" ? "Kullanıcı" : "Admin"}
                  <button
                    onClick={() => handleFilterChange("role", "all")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-sans font-medium text-gray-600 hover:text-gray-900 underline"
              >
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-sm font-sans text-gray-500">Yükleniyor...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-sans text-gray-500">Kullanıcı bulunamadı</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        İsim
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        E-posta
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Sipariş Sayısı
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans font-medium text-gray-900">
                            {user.name || "İsimsiz"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-gray-900">{user.email}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-gray-900">{user.phone || "-"}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Kullanıcı"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-gray-900">{user._count.orders}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm font-sans text-gray-700">
                    Sayfa {page} / {totalPages} (Toplam {total} kullanıcı)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Önceki
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Sonraki
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

