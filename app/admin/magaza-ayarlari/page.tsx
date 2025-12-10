import { redirect } from "next/navigation";

export default function StoreSettingsPage() {
  // Ana mağaza ayarları sayfası - kargo ayarlarına yönlendir
  redirect("/admin/magaza-ayarlari/kargo");
}

