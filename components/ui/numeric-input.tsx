import React from "react";

import { Input, type InputProps } from "@/components/ui/input";

export interface NumericInputProps extends Omit<InputProps, "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Maksimum hane sayısı (opsiyonel). */
  maxLength?: number;
}

/**
 * Tam sayı girişi: rakam dışı karakterleri otomatik temizler (inputMode="numeric").
 * Değer string olarak saklanır ("" veya sadece rakamlar). Temel `Input` üzerine kuruludur.
 */
export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onChange, maxLength, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          let v = e.target.value.replace(/\D/g, "");
          if (maxLength) v = v.slice(0, maxLength);
          onChange(v);
        }}
        {...props}
      />
    );
  },
);
NumericInput.displayName = "NumericInput";
