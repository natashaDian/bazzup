"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { simulatePaymentAction, type PaymentPageData } from "@/lib/payment";

const EWALLET_PROVIDERS = ["GoPay", "OVO", "DANA"];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function validatePhone(value: string) {
  if (!value.trim()) return "Phone number is required.";
  if (!/^0\d{9,13}$/.test(value.trim()))
    return "Enter a valid phone number (e.g. 0812xxxxxxx).";
  return null;
}

function validateEmail(value: string) {
  if (!value.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    return "Enter a valid email address.";
  return null;
}

function validateCardNumber(value: string) {
  const digits = value.replace(/\s/g, "");
  if (!digits) return "Card number is required.";
  if (!/^\d{16}$/.test(digits)) return "Card number must be 16 digits.";
  return null;
}

function validateCardName(value: string) {
  if (!value.trim()) return "Cardholder name is required.";
  return null;
}

function validateExpiry(value: string) {
  if (!value.trim()) return "Expiry date is required.";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value.trim()))
    return "Use MM/YY format.";
  return null;
}

function validateCvv(value: string) {
  if (!value.trim()) return "CVV is required.";
  if (!/^\d{3,4}$/.test(value.trim())) return "CVV must be 3-4 digits.";
  return null;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent";

export function PaymentPageClient({
  data,
  alreadyPaid,
}: {
  data: PaymentPageData;
  alreadyPaid?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"ewallet" | "card">("ewallet");
  const [provider, setProvider] = useState("GoPay");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(alreadyPaid ?? false);
  const [isPending, startTransition] = useTransition();

  function handlePay() {
    setFormError(null);
    const errors: Record<string, string> = {};

    if (tab === "ewallet") {
      const phoneError = validatePhone(phone);
      const emailError = validateEmail(email);
      if (phoneError) errors.phone = phoneError;
      if (emailError) errors.email = emailError;
    } else {
      const cardNumberError = validateCardNumber(cardNumber);
      const cardNameError = validateCardName(cardName);
      const expiryError = validateExpiry(expiry);
      const cvvError = validateCvv(cvv);
      if (cardNumberError) errors.cardNumber = cardNumberError;
      if (cardNameError) errors.cardName = cardNameError;
      if (expiryError) errors.expiry = expiryError;
      if (cvvError) errors.cvv = cvvError;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    startTransition(async () => {
      const method = tab === "ewallet" ? provider : "Card";
      const result = await simulatePaymentAction(data.id, method);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white border rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="size-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="size-7 text-green-700" />
          </div>
          <p className="text-base font-medium mb-1.5">
            Your payment was successful
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            The invoice has been sent to your email.
          </p>
          <button
            onClick={() => router.push("/applications")}
            className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg text-sm"
          >
            Back to my applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="bg-white border rounded-2xl shadow-sm p-8 w-full max-w-3xl">
        <Link
          href="/applications"
          className="flex items-center gap-1.5 text-muted-foreground text-xs mb-5 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to applications
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8">
          <div>
            <p className="text-base font-medium mb-5">Payment method</p>

            <div className="flex gap-5 border-b mb-5">
              <button
                onClick={() => setTab("ewallet")}
                className={`pb-2.5 text-sm ${
                  tab === "ewallet"
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground"
                }`}
              >
                E-wallet
              </button>
              <button
                onClick={() => setTab("card")}
                className={`pb-2.5 text-sm ${
                  tab === "card"
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Card
              </button>
            </div>

            {tab === "ewallet" ? (
              <>
                <div className="flex gap-2 mb-5">
                  {EWALLET_PROVIDERS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs bg-white ${
                        provider === p
                          ? "border border-accent"
                          : "border border-input text-muted-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <label className="text-xs text-muted-foreground block mb-1.5">
                  Phone number
                </label>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="0812xxxxxxx"
                  className={`${inputClass} ${fieldErrors.phone ? "border-destructive" : "border-input"} mb-1`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive mb-3">
                    {fieldErrors.phone}
                  </p>
                )}
                {!fieldErrors.phone && <div className="mb-4" />}

                <label className="text-xs text-muted-foreground block mb-1.5">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="name@email.com"
                  className={`${inputClass} ${fieldErrors.email ? "border-destructive" : "border-input"} mb-1`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive mb-6">
                    {fieldErrors.email}
                  </p>
                )}
                {!fieldErrors.email && <div className="mb-6" />}
              </>
            ) : (
              <>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Card number
                </label>
                <input
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, cardNumber: "" }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  className={`${inputClass} ${fieldErrors.cardNumber ? "border-destructive" : "border-input"} mb-1`}
                />
                {fieldErrors.cardNumber && (
                  <p className="text-xs text-destructive mb-3">
                    {fieldErrors.cardNumber}
                  </p>
                )}
                {!fieldErrors.cardNumber && <div className="mb-4" />}

                <label className="text-xs text-muted-foreground block mb-1.5">
                  Cardholder name
                </label>
                <input
                  value={cardName}
                  onChange={(e) => {
                    setCardName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, cardName: "" }));
                  }}
                  placeholder="As shown on card"
                  className={`${inputClass} ${fieldErrors.cardName ? "border-destructive" : "border-input"} mb-1`}
                />
                {fieldErrors.cardName && (
                  <p className="text-xs text-destructive mb-3">
                    {fieldErrors.cardName}
                  </p>
                )}
                {!fieldErrors.cardName && <div className="mb-4" />}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                      Expiry date
                    </label>
                    <input
                      value={expiry}
                      onChange={(e) => {
                        setExpiry(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, expiry: "" }));
                      }}
                      placeholder="MM/YY"
                      className={`${inputClass} ${fieldErrors.expiry ? "border-destructive" : "border-input"}`}
                    />
                    {fieldErrors.expiry && (
                      <p className="text-xs text-destructive mt-1">
                        {fieldErrors.expiry}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                      CVV
                    </label>
                    <input
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, cvv: "" }));
                      }}
                      placeholder="123"
                      className={`${inputClass} ${fieldErrors.cvv ? "border-destructive" : "border-input"}`}
                    />
                    {fieldErrors.cvv && (
                      <p className="text-xs text-destructive mt-1">
                        {fieldErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {formError && (
              <p className="text-xs text-destructive mb-4">{formError}</p>
            )}

            <button
              onClick={handlePay}
              disabled={isPending}
              className="w-full bg-foreground text-background py-3 rounded-lg text-sm font-medium"
            >
              {isPending
                ? "Processing..."
                : `Pay ${formatRupiah(data.grandTotal)}`}
            </button>
          </div>

          <div className="bg-muted/40 rounded-xl p-5 self-start">
            <p className="text-sm font-medium mb-4">Order summary</p>

            <div className="flex flex-col gap-2 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bazaar</span>
                <span>{data.bazaarTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area</span>
                <span>{data.areaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slot price</span>
                <span>{formatRupiah(data.pricePerSlot)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span>{formatRupiah(data.platformFee)}</span>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between">
              <span className="text-sm">Total</span>
              <span className="text-lg font-medium">
                {formatRupiah(data.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
