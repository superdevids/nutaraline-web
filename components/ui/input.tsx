import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
}

export function Input({
  label,
  hint,
  error,
  invalid,
  id,
  className,
  ...rest
}: InputProps) {
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        aria-invalid={invalid || Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 w-full rounded-md border bg-bg px-3 text-sm text-text",
          "placeholder:text-text-faint",
          "transition-colors focus:border-border-strong",
          invalid || error ? "border-error-border" : "border-border",
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
