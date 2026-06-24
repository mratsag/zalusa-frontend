import React from "react";

import { Input, type InputProps } from "@/components/ui/input";

export interface MeasurementInputProps extends Omit<InputProps, "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Maksimum karakter (varsayılan 7). */
  maxLength?: number;
}

/**
 * Ölçü girişi (cm / kg): virgülü noktaya çevirir, yalnızca rakam + tek ondalık ayraç kabul eder.
 * Mevcut panel davranışını birebir korur: /^\d*\.?\d*$/ gate + maxLength (7) + inputMode="decimal".
 * Geçersiz giriş yok sayılır (eski değer korunur). Değer string saklanır.
 */
export const MeasurementInput = React.forwardRef<HTMLInputElement, MeasurementInputProps>(
  ({ value, onChange, maxLength = 7, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        maxLength={maxLength}
        onChange={(e) => {
          const v = e.target.value.replace(",", ".");
          if (/^\d*\.?\d*$/.test(v)) onChange(v);
        }}
        {...props}
      />
    );
  },
);
MeasurementInput.displayName = "MeasurementInput";
