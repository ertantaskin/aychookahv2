import CouponForm from "@/components/admin/coupons/CouponForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCouponPage({ params }: PageProps) {
  const { id } = await params;
  return <CouponForm couponId={id} />;
}
