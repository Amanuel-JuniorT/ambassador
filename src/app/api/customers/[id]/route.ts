import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { publicCardUrl } from "@/lib/staff";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;
  const { id } = await context.params;
  const customer = await prisma.specialCustomer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const qrPayload = publicCardUrl(customer.token);
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#211711", light: "#ffffff" },
  });

  return NextResponse.json({
    id: customer.id,
    displayId: customer.displayId,
    name: customer.name,
    tin: customer.tin,
    branch: customer.branch,
    discount: customer.discount,
    validThru: customer.validThru,
    status: customer.status,
    createdAt: customer.createdAt,
    qrDataUrl,
  });
}
