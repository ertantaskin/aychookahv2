"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, createContext, useContext, useEffect } from "react";
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
  ChevronDown,
  ChevronRight,
  FolderTree,
  BarChart3,
  Settings,
  Store,
  Menu,
  X,
} from "lucide-react";
import CacheClearButton from "./CacheClearButton";

const SidebarContext = createContext<{ isCollapsed: boolean; setIsCollapsed: (value: boolean) => void }>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analiz", label: "Analiz", icon: BarChart3 },
  {
    href: "/admin/urunler",
    label: "Ürünler",
    icon: Package,
    subItems: [
      { href: "/admin/urunler", label: "Tüm Ürünler" },
      { href: "/admin/urunler/kategoriler", label: "Kategoriler" },
    ],
  },
  { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/admin/medya", label: "Medya Kütüphanesi", icon: Image },
  { href: "/admin/odeme-sistemleri", label: "Ödeme Sistemleri", icon: CreditCard },
  { href: "/admin/seo", label: "SEO Yönetimi", icon: Search },
  {
    href: "/admin/magaza-ayarlari",
    label: "Mağaza Ayarları",
    icon: Settings,
    subItems: [
      { href: "/admin/magaza-ayarlari/kargo", label: "Kargo Ayarları" },
      { href: "/admin/magaza-ayarlari/vergi", label: "Vergi Ayarları" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Eğer kategori sayfasındaysak, ürünler menüsünü açık tut
    if (pathname.startsWith("/admin/urunler")) {
      return ["/admin/urunler"];
    }
    // Eğer mağaza ayarları sayfasındaysak, mağaza ayarları menüsünü açık tut
    if (pathname.startsWith("/admin/magaza-ayarlari")) {
      return ["/admin/magaza-ayarlari"];
    }
    return [];
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    // Çıkış yaptıktan sonra ana sayfaya yönlendir
    window.location.href = "/";
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  useEffect(() => {
    // Sidebar genişliğini CSS variable olarak ayarla (daha hızlı güncelleme için requestAnimationFrame kullan)
    const updateWidth = () => {
      document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '256px');
    };
    requestAnimationFrame(updateWidth);
  }, [isCollapsed]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <aside className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'} bg-black text-white flex flex-col transition-all duration-150 ease-out z-50`}>
      {/* Logo ve Toggle */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-yellow-400" />
            {!isCollapsed && (
              <span className="text-lg font-sans font-semibold text-white">Aychookah</span>
            )}
          </div>
        </div>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded hover:bg-gray-900 transition-colors duration-150 ease-out text-gray-400 hover:text-white"
            aria-label="Sidebar'ı daralt"
          >
            <Menu className="w-4 h-4 transition-transform duration-150" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded hover:bg-gray-900 transition-colors duration-150 ease-out text-gray-400 hover:text-white"
            aria-label="Sidebar'ı genişlet"
          >
            <X className="w-4 h-4 transition-transform duration-150" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const IconComponent = item.icon;
          const isExpanded = expandedItems.includes(item.href);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.href}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-2.5 rounded transition-colors duration-150 ease-out font-sans ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-400 hover:bg-gray-900 hover:text-white"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 transition-colors duration-150 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {!isCollapsed && (
                        <span className={`font-medium transition-colors duration-150 ${isActive ? 'text-white' : 'text-gray-300'}`}>{item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="transition-transform duration-150 ease-out">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </button>
                  {isExpanded && !isCollapsed && (
                    <div className="ml-6 mt-1 space-y-0.5 transition-all duration-150 ease-out">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors duration-150 ease-out font-sans text-sm ${
                              isSubActive
                                ? "bg-gray-900 text-white"
                                : "text-gray-400 hover:bg-gray-900 hover:text-white"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-white' : 'bg-gray-500'}`}></span>
                            <span className={isSubActive ? 'text-white' : 'text-gray-300'}>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
            <Link
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded transition-colors duration-150 ease-out font-sans ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <IconComponent className={`w-5 h-5 transition-colors duration-150 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {!isCollapsed && (
                <span className={`font-medium transition-all duration-150 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'} ${isActive ? 'text-white' : 'text-gray-300'}`}>{item.label}</span>
              )}
            </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800 space-y-1">
        <CacheClearButton isCollapsed={isCollapsed} />
        <Link
          href="/"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded transition-colors duration-150 ease-out font-sans text-gray-400 hover:bg-gray-900 hover:text-white`}
          title={isCollapsed ? "Ana Sayfa" : undefined}
        >
          <Home className="w-5 h-5 transition-colors duration-150" />
          {!isCollapsed && <span className="text-gray-300 transition-all duration-150">Ana Sayfa</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded transition-colors duration-150 ease-out font-sans text-gray-400 hover:bg-gray-900 hover:text-white`}
          title={isCollapsed ? "Çıkış Yap" : undefined}
        >
          <LogOut className="w-5 h-5 transition-colors duration-150" />
          {!isCollapsed && <span className="text-gray-300 transition-all duration-150">Çıkış Yap</span>}
        </button>
      </div>
    </aside>
    </SidebarContext.Provider>
  );
}

