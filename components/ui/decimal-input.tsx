import React from "react";

import { Input, type InputProps } from "@/components/ui/input";

export interface DecimalInputProps extends Omit<InputProps, "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Ondalık basamak sayısı (varsayılan 2). */
  decimals?: number;
  /** Tam kısım maksimum hane (varsayılan 9). */
  maxIntDigits?: number;
}

/**
 * Ondalık/para girişi: virgülü noktaya çevirir, sadece rakam + tek ondalık ayraç,
 * ondalık ve tam kısım uzunluğunu sınırlar (inputMode="decimal"). Değer string saklanır.
 */
export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(
  ({ value, onChange, decimals = 2, maxIntDigits = 9, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          // Virgül → nokta, geçersiz karakterleri at
          let v = e.target.value.replace(",", ".").replace(/[^\d.]/g, "");
          // Tek ondalık ayraç bırak
          const dot = v.indexOf(".");
          if (dot !== -1) {
            v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "");
          }
          const [intPart = "", decPart = ""] = v.split(".");
          let out = intPart.slice(0, maxIntDigits);
          if (v.includes(".")) out += "." + decPart.slice(0, decimals);
          onChange(out);
        }}
        {...props}
      />
    );
  },
);
DecimalInput.displayName = "DecimalInput";
