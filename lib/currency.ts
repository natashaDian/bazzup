export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.trunc(Math.abs(amount)).toString();
  return `Rp ${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
