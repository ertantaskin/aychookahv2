"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Home,
  LogOut,
  Search,
  MessageSquare,
  Image,
} from "lucide-react";
import CacheClearButton from "./CacheClearButton";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/admin/medya", label: "Medya Kütüphanesi", icon: Image },
  { href: "/admin/odeme-sistemleri", label: "Ödeme Sistemleri", icon: CreditCard },
  { href: "/admin/seo", label: "SEO Yönetimi", icon: Search },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-sans font-semibold text-white">Admin Panel</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-sans ${
                isActive
                  ? "bg-gray-800 text-white font-medium"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <CacheClearButton />
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-sans text-gray-300 hover:text-white"
        >
          <Home className="w-5 h-5" />
          <span>Ana Sayfa</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left font-sans text-gray-300 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}

