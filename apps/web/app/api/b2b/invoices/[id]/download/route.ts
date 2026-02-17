import { NextRequest, NextResponse } from "next/server";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { getB2BInvoiceById } from "@/lib/b2b/service";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await Promise.resolve(context.params);
  const invoice = await getB2BInvoiceById(accountId, id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  return NextResponse.json({
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    downloadUrl: invoice.fileUrl,
  });
}
