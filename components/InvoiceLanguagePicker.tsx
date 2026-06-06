"use client";

import type { InvoiceLanguage } from "@/types";
import { INVOICE_LANGUAGES } from "@/lib/constants/invoice-languages";

interface InvoiceLanguagePickerProps {
  value: InvoiceLanguage;
  onChange: (language: InvoiceLanguage) => void;
  disabled?: boolean;
}

export function InvoiceLanguagePicker({
  value,
  onChange,
  disabled = false,
}: InvoiceLanguagePickerProps) {
  return (
    <div className="w-full max-w-sm space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
        Invoice language
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {INVOICE_LANGUAGES.map((language) => {
          const selected = value === language.id;

          return (
            <button
              key={language.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(language.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                selected
                  ? "bg-brand text-primary-foreground border-brand shadow-sh-sm"
                  : "bg-card/80 text-muted-foreground border-border hover:border-brand/40"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "active:scale-95"}`}
            >
              {language.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
