import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import "./TextField.css";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  hint?: string;
}

/** Campo de selección con el mismo aspecto que TextField. */
export function SelectField({
  label,
  options,
  error,
  hint,
  id,
  ...rest
}: SelectFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      <select id={fieldId} className="field__input" {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="field__msg field__msg--error">{error}</span>
      ) : hint ? (
        <span className="field__msg">{hint}</span>
      ) : null}
    </div>
  );
}
