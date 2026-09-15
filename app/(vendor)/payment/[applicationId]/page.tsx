import { redirect } from "next/navigation";
import { requireVendor } from "@/lib/auth";
import { getPaymentPageData } from "@/lib/payment";
import { PaymentPageClient } from "@/components/payment-page-client";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const user = await requireVendor();
  const data = await getPaymentPageData(applicationId, user.id);

  if (!data) {
    redirect("/applications");
  }

  if (data.status !== "APPROVED" && data.status !== "CONFIRMED") {
    redirect("/applications");
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <PaymentPageClient
        data={data}
        alreadyPaid={data.status === "CONFIRMED"}
      />
    </main>
  );
}
