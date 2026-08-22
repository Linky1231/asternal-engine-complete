/** Reglas compartidas para los importes de donación antes de abrir una transacción. */
export function donationError(amount: number, balance: number): string | null {
  if (!Number.isInteger(amount) || amount <= 0) return "Elige una cantidad válida";
  if (amount > balance) return "No tienes suficientes orbes";
  return null;
}
