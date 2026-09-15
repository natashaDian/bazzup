// Formats without Intl.NumberFormat on purpose - its "id-ID" thousands
// separator differs between the server's Node version and the browser's
// engine (a plain space vs. a non-breaking space), which causes a
// server/client hydration mismatch wherever this text is rendered directly.
export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.trunc(Math.abs(amount)).toString();
  return `Rp ${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
