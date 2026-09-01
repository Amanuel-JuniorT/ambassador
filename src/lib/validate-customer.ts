const NAME_PATTERN = /^[A-Z][A-Z .'\-]{0,78}$/;

export function normalizeCustomerName(raw: unknown) {
  const name = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

  if (!name) return { error: "Enter a full name." };
  if (name.length < 2) return { error: "Name must be at least two characters." };
  if (!NAME_PATTERN.test(name)) {
    return { error: "Use letters, spaces, hyphens or apostrophes only." };
  }
  return { name };
}

export function normalizeTin(raw: unknown) {
  const tin = String(raw ?? "").trim();
  if (tin && !/^[0-9]{6,15}$/.test(tin)) {
    return { error: "TIN should be 6–15 digits, or leave it blank." };
  }
  return { tin: tin || null };
}

export function normalizeValidThru(raw: unknown) {
  const validThru = String(raw ?? "").trim();
  if (validThru && !/^\d{2}\/\d{2}$/.test(validThru)) {
    return { error: "Valid thru should be MM/YY." };
  }
  return { validThru: validThru || null };
}

export function normalizeDiscount(raw: unknown) {
  const discount = Number(raw);
  if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
    return { error: "Discount must be a whole number between 1 and 100." };
  }
  return { discount };
}
