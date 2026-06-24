import React from "react";

import { Input, type InputProps } from "@/components/ui/input";

export interface MeasurementInputProps extends Omit<InputProps, "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Maksimum karakter (varsayılan 7). */
  maxLength?: number;
  /** true ise base Input kutusu olmadan düz <input> render eder (bespoke stil / şeffaf kutu içinde). */
  bare?: boolean;
}

/**
 * Ölçü girişi (cm / kg): virgülü noktaya çevirir, yalnızca rakam + tek ondalık ayraç kabul eder.
 * Mevcut panel davranışını birebir korur: /^\d*\.?\d*$/ gate + maxLength (7) + inputMode="decimal".
 * Geçersiz giriş yok sayılır (eski değer korunur). Değer string saklanır.
 * `bare` ile temel Input kutusu uygulanmaz; verilen className'li düz <input> döner.
 */
export const MeasurementInput = React.forwardRef<HTMLInputElement, MeasurementInputProps>(
  ({ value, onChange, maxLength = 7, bare = false, icon, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(",", ".");
      if (/^\d*\.?\d*$/.test(v)) onChange(v);
    };

    if (bare) {
      // base Input kutusu yok — bespoke stil için ham input
      const { className, ...rest } = props;
      return (
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          className={className}
          {...rest}
        />
      );
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        maxLength={maxLength}
        onChange={handleChange}
        icon={icon}
        {...props}
      />
    );
  },
);
MeasurementInput.displayName = "MeasurementInput";
