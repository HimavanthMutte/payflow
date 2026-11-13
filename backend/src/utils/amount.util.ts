export function parsePaise(amount: string | number | bigint): bigint {
  if (typeof amount === 'bigint') return amount;
  const str = String(amount).trim();
  if (!/^\d+$/.test(str)) throw new Error(`Invalid paise amount: ${str}`);
  return BigInt(str);
}

export function paiseToRupees(paise: bigint): string {
  const rupees = paise / 100n;
  const paiseRemainder = paise % 100n;
  return `${rupees}.${String(paiseRemainder).padStart(2, '0')}`;
}

export function formatPaise(paise: bigint): string {
  return `₹${paiseToRupees(paise)}`;
}

export function validateAmount(
  paise: bigint,
  min: bigint,
  max: bigint,
): void {
  if (paise <= 0n) throw new Error('Amount must be positive');
  if (paise < min)
    throw new Error(`Amount below minimum: ${formatPaise(min)}`);
  if (paise > max)
    throw new Error(`Amount exceeds maximum: ${formatPaise(max)}`);
}

export function rupeesToPaise(rupees: string): bigint {
  const [whole, decimal = '00'] = rupees.split('.');
  const paddedDecimal = decimal.substring(0, 2).padEnd(2, '0');
  return BigInt(whole) * 100n + BigInt(paddedDecimal);
}
