import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "@/components/account/ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session || session.user.role !== "user") {
    redirect("/giris?error=login_required");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  if (!user) {
    redirect("/giris");
  }

  return <ProfileClient user={user} />;
}

