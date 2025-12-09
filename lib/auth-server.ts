import { auth } from "@/lib/auth";

export const getSession = async () => {
  return await auth();
};

