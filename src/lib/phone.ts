export const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** Formata como (11) 98765-4321 enquanto a pessoa digita. */
export function formatPhoneBR(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** DDD válido (11–99) + 8 dígitos (fixo) ou 9 começando com 9 (celular). */
export function isValidPhoneBR(value: string): boolean {
  const d = onlyDigits(value);
  if (!/^[1-9][1-9]/.test(d)) return false;
  return d.length === 10 || (d.length === 11 && d[2] === "9");
}
