import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SEOClient from "@/components/admin/seo/SEOClient";
import { getSiteSEO, getAllPageSEO } from "@/lib/actions/seo";
import { getAllFAQs } from "@/lib/actions/faq";
import { getAllAvailablePages } from "@/lib/utils/routes";

export default async function SEOPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris?error=admin_required");
  }

  const siteSEO = await getSiteSEO();
  const pageSEOList = await getAllPageSEO();
  const faqs = await getAllFAQs();
  const availablePages = await getAllAvailablePages();

  return <SEOClient initialSiteSEO={siteSEO} initialPageSEOList={pageSEOList} initialFAQs={faqs} availablePages={availablePages} />;
}

