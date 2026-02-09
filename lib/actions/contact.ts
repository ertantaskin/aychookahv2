"use server";

import { prisma } from "@/lib/prisma";

const DEFAULT_CONTACT = {
  email: "info@aychookah.com",
  phone: "+90 XXX XXX XX XX",
  whatsapp: "905XXXXXXXXX",
  address: "İstanbul, Türkiye",
  workingHours: "Pzt - Cum: 09:00 - 18:00",
  footerDescription:
    "Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın buluştuğu profesyonel nargile deneyimi.",
} as const;

export type ContactInfoFromDb = {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  footerDescription: string;
};

/**
 * Veritabanından iletişim bilgilerini çeker (contact_info tablosu). Tablo yoksa varsayılan döner; throw etmez.
 */
export async function getContactInfoFromDb(): Promise<ContactInfoFromDb> {
  try {
    const rows = await prisma.$queryRaw<
      { email: string; phone: string; whatsapp: string | null; address: string | null; workingHours: string | null; footerDescription: string | null }[]
    >`SELECT email, phone, whatsapp, address, "workingHours", "footerDescription" FROM contact_info LIMIT 1`;
    const row = Array.isArray(rows) ? rows[0] : null;

    if (!row) {
      return { ...DEFAULT_CONTACT };
    }

    return {
      email: row.email ?? DEFAULT_CONTACT.email,
      phone: row.phone ?? DEFAULT_CONTACT.phone,
      whatsapp: row.whatsapp ?? DEFAULT_CONTACT.whatsapp,
      address: row.address ?? DEFAULT_CONTACT.address,
      workingHours: row.workingHours ?? DEFAULT_CONTACT.workingHours,
      footerDescription: row.footerDescription ?? DEFAULT_CONTACT.footerDescription,
    };
  } catch (_error) {
    return { ...DEFAULT_CONTACT };
  }
}
