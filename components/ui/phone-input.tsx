import React from "react";

import { cn } from "@/lib/cn";
import { formatNational, maxNationalDigits, splitPhone } from "@/lib/phone";

export interface PhoneInputProps {
  /** Ham telefon değeri (ör. "+905321234567"). */
  value: string;
  /** Ham değeri ("+" + ülke kodu + ulusal rakamlar) döndürür. */
  onChange: (value: string) => void;
  /** Değer boşken kullanılacak varsayılan ülke kodu (ör. "+90", "+49"). */
  defaultDialCode?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  /** Kendi kutusu (border/bg) olan bir sarmalayıcı (ör. <Field>) içindeyse true. */
  bare?: boolean;
}

/**
 * Ülke kodu KİLİTLİ (silinemez) prefix olarak gösterilir; kullanıcı yalnızca
 * ulusal numarayı yazar. Numara ülke uzunluğuna göre otomatik gruplanır ve kırpılır.
 * Değer ham ("+90532...") saklanır.
 *
 * Varsayılan: kendi kutusunu çizer (standalone kullanım).
 * `bare` → kutusuz, şeffaf satır (örn. <Field> içinde, kutuyu sarmalayıcı sağlar).
 */
export function PhoneInput({
  value,
  onChange,
  defaultDialCode = "+90",
  placeholder,
  className,
  disabled,
  id,
  bare = false,
}: PhoneInputProps) {
  const { dialCode, national } = splitPhone(value, defaultDialCode);

  function handleNational(input: string) {
    const digits = input.replace(/\D/g, "").slice(0, maxNationalDigits(dialCode));
    onChange(dialCode + digits);
  }

  const boxCls = bare
    ? "flex w-full items-center gap-2"
    : "flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition-shadow focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200/60";

  return (
    <div className={cn(boxCls, disabled && "opacity-60", className)}>
      {/* Kilitli ülke kodu — yazarak silinemez */}
      <span className="select-none whitespace-nowrap text-sm font-semibold text-slate-500">
        {dialCode}
      </span>
      <span className="h-5 w-px shrink-0 bg-slate-300" aria-hidden />
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        value={formatNational(national, dialCode)}
        onChange={(e) => handleNational(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent p-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
    </div>
  );
}
