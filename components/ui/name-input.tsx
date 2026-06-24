import React from "react";

import { Input, type InputProps } from "@/components/ui/input";

export interface NameInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** Maksimum karakter sayısı (varsayılan 60). */
  maxLength?: number;
}

/**
 * Ad / Soyad girişi: rakamları otomatik temizler ve uzunluğu sınırlar.
 * Temel `Input` üzerine kuruludur; `<Field>` içinde veya standalone aynı çalışır.
 */
export const NameInput = React.forwardRef<HTMLInputElement, NameInputProps>(
  ({ value, onChange, maxLength = 60, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.replace(/[0-9]/g, "").slice(0, maxLength))}
        {...props}
      />
    );
  },
);
NameInput.displayName = "NameInput";
