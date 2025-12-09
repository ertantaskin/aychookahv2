import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getAddresses } from "@/lib/actions/addresses";
import AddressesClient from "@/components/account/AddressesClient";

export default async function AddressesPage() {
  const session = await getSession();

  if (!session || session.user.role !== "user") {
    redirect("/giris?error=login_required");
  }

  const addresses = await getAddresses();

  return <AddressesClient addresses={addresses} />;
}

