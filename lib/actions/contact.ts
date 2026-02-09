"use server";

import { prisma } from "@/lib/prisma";

const DEFAULT_CONTACT = {
  email: "info@aychookah.com",
  phone: "+90 XXX XXX XX XX",
  address: "İstanbul, Türkiye",
  workingHours: "Pzt - Cum: 09:00 - 18:00",
  footerDescription:
    "Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın buluştuğu profesyonel nargile deneyimi.",
} as const;

export type ContactInfoFromDb = {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  footerDescription: string;
};

/**
 * Veritabanından iletişim bilgilerini çeker (contact_info tablosu).
 */
export async function getContactInfoFromDb(): Promise<ContactInfoFromDb> {
  try {
    const row = await prisma.contactInfo.findFirst();

    if (!row) {
      return { ...DEFAULT_CONTACT };
    }

    return {
      email: row.email,
      phone: row.phone,
      address: row.address ?? DEFAULT_CONTACT.address,
      workingHours: row.workingHours ?? DEFAULT_CONTACT.workingHours,
      footerDescription: row.footerDescription ?? DEFAULT_CONTACT.footerDescription,
    };
  } catch (error) {
    console.error("Error fetching contact info from database:", error);
    return { ...DEFAULT_CONTACT };
  }
}
