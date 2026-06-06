import { describe, expect, it } from "vitest";
import {
  getInvoiceLanguageLabel,
  getSttLanguageCode,
  isInvoiceLanguage,
} from "@/lib/constants/invoice-languages";

describe("invoice languages", () => {
  it("validates supported language ids", () => {
    expect(isInvoiceLanguage("english")).toBe(true);
    expect(isInvoiceLanguage("yoruba")).toBe(true);
    expect(isInvoiceLanguage("pidgin")).toBe(true);
    expect(isInvoiceLanguage("french")).toBe(false);
  });

  it("maps language ids to labels and STT codes", () => {
    expect(getInvoiceLanguageLabel("pidgin")).toBe("Pidgin");
    expect(getSttLanguageCode("yoruba")).toBe("yoruba");
  });
});
