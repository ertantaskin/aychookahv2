import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const eftHavaleGateway = await prisma.paymentGateway.findUnique({
      where: { name: "eft-havale" },
    });

    if (!eftHavaleGateway || !eftHavaleGateway.config) {
      return NextResponse.json({ bankInfo: null });
    }

    const config = eftHavaleGateway.config as any;
    const bankInfo = {
      bankName: config.bankName || null,
      accountName: config.accountName || null,
      iban: config.iban || null,
      branch: config.branch || null,
      accountNumber: config.accountNumber || null,
    };

    return NextResponse.json({ bankInfo });
  } catch (error) {
    console.error("Error fetching bank info:", error);
    return NextResponse.json({ bankInfo: null });
  }
}

