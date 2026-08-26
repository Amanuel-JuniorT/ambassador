import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PrintCard } from "@/components/PrintCard";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { publicCardUrl } from "@/lib/staff";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const customer = await prisma.specialCustomer.findUnique({ where: { id } });
  if (!customer) notFound();

  const qrDataUrl = await QRCode.toDataURL(publicCardUrl(customer.token), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#211711", light: "#ffffff" },
  });

  return (
    <PrintCard
      customer={{
        id: customer.id,
        displayId: customer.displayId,
        name: customer.name,
        validThru: customer.validThru,
        discount: customer.discount,
        createdAt: customer.createdAt.toISOString(),
        qrDataUrl,
      }}
    />
  );
}
