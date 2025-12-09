"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSiteSEO, createOrUpdatePageSEO, deletePageSEO } from "@/lib/actions/seo";
import { createFAQ, updateFAQ, deleteFAQ } from "@/lib/actions/faq";
import { Settings, FileText, Plus, Trash2, Save, HelpCircle, MapPin, Phone, Mail, Globe, Edit } from "lucide-react";

interface SiteSEO {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string | null;
  favicon: string | null;
  ogImage: string | null;
  twitterHandle: string | null;
  facebookAppId: string | null;
  googleSiteVerification: string | null;
  bingVerification: string | null;
  robotsTxt: string | null;
  analyticsId: string | null;
}

interface PageSEO {
  id: string;
  pagePath: string;
  pageName: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogType: string | null;
  noindex: boolean;
  nofollow: boolean;
  canonical: string | null;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  pagePath: string | null;
  order: number;
  isActive: boolean;
}

interface PageOption {
  path: string;
  label: string;
}

interface SEOClientProps {
  initialSiteSEO: SiteSEO;
  initialPageSEOList: PageSEO[];
  initialFAQs: FAQ[];
  availablePages: PageOption[];
}

export default function SEOClient({ initialSiteSEO, initialPageSEOList, initialFAQs, availablePages }: SEOClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"site" | "pages" | "faq">("site");
  const [siteTabSection, setSiteTabSection] = useState<"basic" | "social" | "contact" | "local">("basic");
  const [siteSEO, setSiteSEO] = useState(initialSiteSEO);
  const [pageSEOList, setPageSEOList] = useState(initialPageSEOList);
  const [faqs, setFaqs] = useState(initialFAQs);
  const [isEditingPage, setIsEditingPage] = useState<string | null>(null);
  const [newPage, setNewPage] = useState<Partial<PageSEO> | null>(null);
  const [isEditingFAQ, setIsEditingFAQ] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState<Partial<FAQ> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSiteSEOSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateSiteSEO(formData);

    if (result.success) {
      toast.success("Site SEO ayarları başarıyla güncellendi");
      setSiteSEO(result.data);
      router.refresh();
    } else {
      toast.error(result.error || "Bir hata oluştu");
    }

    setIsSubmitting(false);
  };

  const handlePageSEOSubmit = async (e: React.FormEvent<HTMLFormElement>, pageId?: string) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrUpdatePageSEO(formData);

    if (result.success) {
      toast.success("Sayfa SEO ayarları başarıyla kaydedildi");
      if (pageId) {
        setPageSEOList(pageSEOList.map(p => p.id === pageId ? result.data : p));
        setIsEditingPage(null);
      } else {
        setPageSEOList([...pageSEOList, result.data]);
        setNewPage(null);
      }
      router.refresh();
    } else {
      toast.error(result.error || "Bir hata oluştu");
    }

    setIsSubmitting(false);
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm("Bu sayfa SEO ayarlarını silmek istediğinize emin misiniz?")) {
      return;
    }

    const result = await deletePageSEO(id);
    if (result.success) {
      toast.success("Sayfa SEO ayarları silindi");
      setPageSEOList(pageSEOList.filter(p => p.id !== id));
      router.refresh();
    } else {
      toast.error(result.error || "Bir hata oluştu");
    }
  };

  const handleFAQSubmit = async (e: React.FormEvent<HTMLFormElement>, faqId?: string) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = faqId 
      ? await updateFAQ(faqId, formData)
      : await createFAQ(formData);

    if (result.success) {
      toast.success(faqId ? "FAQ güncellendi" : "FAQ oluşturuldu");
      if (faqId) {
        setFaqs(faqs.map(f => f.id === faqId ? result.data : f));
        setIsEditingFAQ(null);
      } else {
        setFaqs([...faqs, result.data]);
        setNewFAQ(null);
      }
      router.refresh();
    } else {
      toast.error(result.error || "Bir hata oluştu");
    }

    setIsSubmitting(false);
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("Bu FAQ'yi silmek istediğinize emin misiniz?")) {
      return;
    }

    const result = await deleteFAQ(id);
    if (result.success) {
      toast.success("FAQ silindi");
      setFaqs(faqs.filter(f => f.id !== id));
      router.refresh();
    } else {
      toast.error(result.error || "Bir hata oluştu");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-sans font-bold text-gray-900">SEO Yönetimi</h1>
        <p className="text-sm font-sans text-gray-600 mt-2">Site ve sayfa bazlı SEO ayarlarını yönetin</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("site")}
            className={`py-4 px-1 border-b-2 font-sans font-medium text-sm ${
              activeTab === "site"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Site SEO
          </button>
          <button
            onClick={() => setActiveTab("pages")}
            className={`py-4 px-1 border-b-2 font-sans font-medium text-sm ${
              activeTab === "pages"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Sayfa SEO
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-4 px-1 border-b-2 font-sans font-medium text-sm ${
              activeTab === "faq"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <HelpCircle className="w-5 h-5 inline mr-2" />
            FAQ Yönetimi
          </button>
        </nav>
      </div>

      {/* Site SEO Tab */}
      {activeTab === "site" && (
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSiteSEOSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Site Adı *
                </label>
                <input
                  type="text"
                  name="siteName"
                  defaultValue={siteSEO.siteName}
                  required
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Site URL *
                </label>
                <input
                  type="url"
                  name="siteUrl"
                  defaultValue={siteSEO.siteUrl}
                  required
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Site Açıklaması *
                </label>
                <textarea
                  name="siteDescription"
                  defaultValue={siteSEO.siteDescription}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all resize-y"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Varsayılan Başlık *
                </label>
                <input
                  type="text"
                  name="defaultTitle"
                  defaultValue={siteSEO.defaultTitle}
                  required
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Varsayılan Açıklama *
                </label>
                <textarea
                  name="defaultDescription"
                  defaultValue={siteSEO.defaultDescription}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all resize-y"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Varsayılan Anahtar Kelimeler
                </label>
                <input
                  type="text"
                  name="defaultKeywords"
                  defaultValue={siteSEO.defaultKeywords || ""}
                  placeholder="kelime1, kelime2, kelime3"
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Favicon URL
                </label>
                <input
                  type="url"
                  name="favicon"
                  defaultValue={siteSEO.favicon || ""}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
                <p className="mt-1 text-xs font-sans text-gray-500">Favicon görselinin URL'ini girin (örn: .ico, .png, .svg)</p>
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Open Graph Görseli
                </label>
                <input
                  type="url"
                  name="ogImage"
                  defaultValue={siteSEO.ogImage || ""}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  name="twitterHandle"
                  defaultValue={siteSEO.twitterHandle || ""}
                  placeholder="@aychookah"
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Facebook App ID
                </label>
                <input
                  type="text"
                  name="facebookAppId"
                  defaultValue={siteSEO.facebookAppId || ""}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Google Site Verification
                </label>
                <input
                  type="text"
                  name="googleSiteVerification"
                  defaultValue={siteSEO.googleSiteVerification || ""}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Bing Verification
                </label>
                <input
                  type="text"
                  name="bingVerification"
                  defaultValue={siteSEO.bingVerification || ""}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Analytics ID
                </label>
                <input
                  type="text"
                  name="analyticsId"
                  defaultValue={siteSEO.analyticsId || ""}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  robots.txt İçeriği
                </label>
                <textarea
                  name="robotsTxt"
                  defaultValue={siteSEO.robotsTxt || ""}
                  rows={6}
                  placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin"
                  className="w-full px-4 py-2.5 font-mono text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 font-sans bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Page SEO Tab */}
      {activeTab === "pages" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-sans font-semibold text-gray-900">Sayfa SEO Ayarları</h2>
            <button
              onClick={() => setNewPage({ pagePath: "", pageName: "", noindex: false, nofollow: false, ogType: "website" })}
              className="px-4 py-2.5 font-sans bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Sayfa SEO
            </button>
          </div>

          {/* New Page Form */}
          {newPage && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-sans font-semibold mb-4 text-gray-900">Yeni Sayfa SEO Ekle</h3>
              <form onSubmit={(e) => handlePageSEOSubmit(e)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Sayfa Yolu *
                    </label>
                    <select
                      name="pagePath"
                      required
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                      onChange={(e) => {
                        const selectedPage = availablePages.find(p => p.path === e.target.value);
                        if (selectedPage && !newPage.pageName) {
                          setNewPage({ ...newPage, pagePath: e.target.value, pageName: selectedPage.label });
                        } else {
                          setNewPage({ ...newPage, pagePath: e.target.value });
                        }
                      }}
                    >
                      <option value="">Sayfa Seçin</option>
                      {availablePages.map((page) => (
                        <option key={page.path} value={page.path}>
                          {page.label} ({page.path})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Mevcut sayfalardan seçin veya yeni sayfa yolu girin</p>
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Sayfa Adı *
                    </label>
                    <input
                      type="text"
                      name="pageName"
                      required
                      placeholder="Ürünler"
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Başlık
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Anahtar Kelimeler
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      placeholder="kelime1, kelime2"
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      name="canonical"
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="noindex"
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    />
                    <span className="text-sm font-sans text-gray-700">Noindex</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="nofollow"
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    />
                    <span className="text-sm font-sans text-gray-700">Nofollow</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPage(null)}
                    className="px-6 py-3 font-sans border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 font-sans bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Pages */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      Sayfa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageSEOList.map((page) => (
                    <tr key={page.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-sans font-medium text-gray-900">{page.pageName}</div>
                        <div className="text-sm font-sans text-gray-500">{page.pagePath}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-sans text-gray-900">{page.title || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {page.noindex && (
                            <span className="px-2 py-1 text-xs font-sans bg-red-100 text-red-800 rounded">
                              Noindex
                            </span>
                          )}
                          {page.nofollow && (
                            <span className="px-2 py-1 text-xs font-sans bg-orange-100 text-orange-800 rounded">
                              Nofollow
                            </span>
                          )}
                          {!page.noindex && !page.nofollow && (
                            <span className="px-2 py-1 text-xs font-sans bg-green-100 text-green-800 rounded">
                              İndeksleniyor
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-sans font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsEditingPage(page.id)}
                            className="text-gray-900 hover:text-gray-700 font-sans"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-600 hover:text-red-800 font-sans"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Page SEO Modal */}
          {isEditingPage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-sans font-semibold mb-4 text-gray-900">Sayfa SEO Düzenle</h3>
                {(() => {
                  const page = pageSEOList.find(p => p.id === isEditingPage);
                  if (!page) return null;
                  return (
                    <form onSubmit={(e) => handlePageSEOSubmit(e, page.id)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Sayfa Yolu *
                          </label>
                          <select
                            name="pagePath"
                            required
                            defaultValue={page.pagePath}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                          >
                            {availablePages.map((p) => (
                              <option key={p.path} value={p.path}>
                                {p.label} ({p.path})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Sayfa Adı *
                          </label>
                          <input
                            type="text"
                            name="pageName"
                            required
                            defaultValue={page.pageName}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Başlık
                          </label>
                          <input
                            type="text"
                            name="title"
                            defaultValue={page.title || ""}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            OG Type
                          </label>
                          <select
                            name="ogType"
                            defaultValue={page.ogType || "website"}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                          >
                            <option value="website">Website</option>
                            <option value="article">Article</option>
                            <option value="product">Product</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Açıklama
                          </label>
                          <textarea
                            name="description"
                            rows={3}
                            defaultValue={page.description || ""}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Anahtar Kelimeler
                          </label>
                          <input
                            type="text"
                            name="keywords"
                            defaultValue={page.keywords || ""}
                            placeholder="kelime1, kelime2"
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            OG Başlık
                          </label>
                          <input
                            type="text"
                            name="ogTitle"
                            defaultValue={page.ogTitle || ""}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            OG Açıklama
                          </label>
                          <textarea
                            name="ogDescription"
                            rows={2}
                            defaultValue={page.ogDescription || ""}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            OG Görsel
                          </label>
                          <input
                            type="url"
                            name="ogImage"
                            defaultValue={page.ogImage || ""}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Canonical URL
                          </label>
                          <input
                            type="url"
                            name="canonical"
                            defaultValue={page.canonical || ""}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="noindex"
                            defaultChecked={page.noindex}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                          />
                          <span className="text-sm font-sans text-gray-700">Noindex</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="nofollow"
                            defaultChecked={page.nofollow}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                          />
                          <span className="text-sm font-sans text-gray-700">Nofollow</span>
                        </label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingPage(null)}
                          className="px-6 py-3 font-sans border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 font-sans bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Kaydediliyor..." : "Güncelle"}
                        </button>
                      </div>
                    </form>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-sans font-semibold text-gray-900">FAQ Yönetimi</h2>
            <button
              onClick={() => setNewFAQ({ question: "", answer: "", pagePath: null, order: 0, isActive: true })}
              className="px-4 py-2.5 font-sans bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni FAQ
            </button>
          </div>

          {/* New FAQ Form */}
          {newFAQ && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-sans font-semibold mb-4 text-gray-900">Yeni FAQ Ekle</h3>
              <form onSubmit={(e) => handleFAQSubmit(e)} className="space-y-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Soru *
                  </label>
                  <input
                    type="text"
                    name="question"
                    required
                    placeholder="Sık sorulan soru"
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Cevap *
                  </label>
                  <textarea
                    name="answer"
                    required
                    rows={4}
                    placeholder="Detaylı cevap"
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all resize-y"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Sayfa Yolu (Opsiyonel)
                    </label>
                    <select
                      name="pagePath"
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                      onChange={(e) => {
                        setNewFAQ({ ...newFAQ, pagePath: e.target.value || null });
                      }}
                    >
                      <option value="">--- Genel FAQ (Tüm Sayfalar) ---</option>
                      {availablePages.map((page) => (
                        <option key={page.path} value={page.path}>
                          {page.label} ({page.path})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Genel FAQ seçilirse tüm sayfalarda gösterilir</p>
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                      Sıra
                    </label>
                    <input
                      type="number"
                      name="order"
                      defaultValue={0}
                      min={0}
                      className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    />
                    <span className="text-sm font-sans text-gray-700">Aktif</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFAQ(null)}
                    className="px-6 py-3 font-sans border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 font-sans bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing FAQs */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      Soru
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      Sayfa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faqs.map((faq) => (
                    <tr key={faq.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-sans font-medium text-gray-900">{faq.question}</div>
                        <div className="text-sm font-sans text-gray-500 mt-1 line-clamp-2">{faq.answer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-sans text-gray-900">
                          {faq.pagePath || <span className="text-gray-400">Genel</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-sans text-gray-900">{faq.order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {faq.isActive ? (
                          <span className="px-2 py-1 text-xs font-sans bg-green-100 text-green-800 rounded">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-sans bg-gray-100 text-gray-800 rounded">
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-sans font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsEditingFAQ(faq.id)}
                            className="text-gray-900 hover:text-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {faqs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm font-sans text-gray-500">
                        Henüz FAQ eklenmemiş
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit FAQ Modal */}
          {isEditingFAQ && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-sans font-semibold mb-4 text-gray-900">FAQ Düzenle</h3>
                {(() => {
                  const faq = faqs.find(f => f.id === isEditingFAQ);
                  if (!faq) return null;
                  return (
                    <form onSubmit={(e) => handleFAQSubmit(e, faq.id)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Soru *
                        </label>
                        <input
                          type="text"
                          name="question"
                          required
                          defaultValue={faq.question}
                          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Cevap *
                        </label>
                        <textarea
                          name="answer"
                          required
                          rows={4}
                          defaultValue={faq.answer}
                          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Sayfa Yolu
                          </label>
                          <select
                            name="pagePath"
                            defaultValue={faq.pagePath || ""}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">--- Genel FAQ (Tüm Sayfalar) ---</option>
                            {availablePages.map((page) => (
                              <option key={page.path} value={page.path}>
                                {page.label} ({page.path})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Sıra
                          </label>
                          <input
                            type="number"
                            name="order"
                            defaultValue={faq.order}
                            min={0}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            defaultChecked={faq.isActive}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                          />
                          <span className="text-sm font-sans text-gray-700">Aktif</span>
                        </label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingFAQ(null)}
                          className="px-6 py-3 font-sans border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 font-sans bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Kaydediliyor..." : "Güncelle"}
                        </button>
                      </div>
                    </form>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

