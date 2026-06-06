export const INVOICE_LANGUAGES = [
  { id: "english", label: "English", sttCode: "english" },
  { id: "yoruba", label: "Yoruba", sttCode: "yoruba" },
  { id: "pidgin", label: "Pidgin", sttCode: "pidgin" },
] as const;

export type InvoiceLanguage = (typeof INVOICE_LANGUAGES)[number]["id"];

export function isInvoiceLanguage(value: string): value is InvoiceLanguage {
  return INVOICE_LANGUAGES.some((lang) => lang.id === value);
}

export function getInvoiceLanguageLabel(language: InvoiceLanguage): string {
  return INVOICE_LANGUAGES.find((lang) => lang.id === language)?.label ?? "English";
}

export function getSttLanguageCode(language: InvoiceLanguage): string {
  return INVOICE_LANGUAGES.find((lang) => lang.id === language)?.sttCode ?? "english";
}
