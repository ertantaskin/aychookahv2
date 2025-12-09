import { getMediaList } from "@/lib/actions/media";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  const { media, pagination } = await getMediaList(1, 20);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-gray-900">Medya Kütüphanesi</h1>
        <p className="font-sans text-sm text-gray-600 mt-1">
          Görsellerinizi yükleyin, düzenleyin ve yönetin
        </p>
      </div>
      <MediaLibrary initialMedia={media} initialPagination={pagination} />
    </div>
  );
}

