import React from "react";

import { cn } from "@/lib/cn";

export interface OTPInputHandle {
  /** İlk kutuya odaklan (kod gönderildikten sonra parent çağırır). */
  focus: () => void;
}

export interface OTPInputProps {
  /** Hane dizisi (uzunluk = `length`). */
  value: string[];
  onChange: (next: string[]) => void;
  /** Hane sayısı (varsayılan 6). */
  length?: number;
  /** Kapsayıcı (gap vb.). */
  className?: string;
  /** Her kutuya her zaman uygulanan temel sınıflar. */
  boxClassName?: string;
  /** Hane doluyken eklenen sınıflar. */
  filledClassName?: string;
  /** Hane boşken eklenen sınıflar. */
  emptyClassName?: string;
  disabled?: boolean;
}

/**
 * 6 haneli (yapılandırılabilir) doğrulama kodu girişi.
 * Tüm davranış tek yerde: tek hane + otomatik ileri-odak, backspace geri-odak,
 * yapıştırma (paste) ile toplu doldurma, sadece rakam. Görünüm tamamen className
 * prop'larıyla verilir (her kullanım kendi stilini birebir korur).
 * Parent, kod gönderildikten sonra ref ile .focus() çağırarak ilk kutuya odaklanır.
 */
export const OTPInput = React.forwardRef<OTPInputHandle, OTPInputProps>(
  ({ value, onChange, length = 6, className, boxClassName, filledClassName, emptyClassName, disabled }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    React.useImperativeHandle(ref, () => ({
      focus: () => inputRefs.current[0]?.focus(),
    }));

    function handleInput(index: number, raw: string) {
      if (raw.length > 1) {
        const digits = raw.replace(/[^0-9]/g, "").slice(0, length).split("");
        const next = [...value];
        digits.forEach((d, i) => { if (index + i < length) next[index + i] = d; });
        onChange(next);
        const nextIdx = Math.min(index + digits.length, length - 1);
        inputRefs.current[nextIdx]?.focus();
        return;
      }
      const digit = raw.replace(/[^0-9]/g, "");
      const next = [...value];
      next[index] = digit;
      onChange(next);
      if (digit && index < length - 1) inputRefs.current[index + 1]?.focus();
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    return (
      <div className={className}>
        {value.map((digit, idx) => (
          <input
            key={idx}
            ref={el => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={length}
            value={digit}
            disabled={disabled}
            onChange={e => handleInput(idx, e.target.value)}
            onKeyDown={e => handleKeyDown(idx, e)}
            onPaste={e => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
              if (pasted) handleInput(0, pasted);
            }}
            className={cn(boxClassName, digit ? filledClassName : emptyClassName)}
          />
        ))}
      </div>
    );
  },
);
OTPInput.displayName = "OTPInput";
