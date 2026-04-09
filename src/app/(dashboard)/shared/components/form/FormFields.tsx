"use client";

export function FormField({
  label,
  name,
  defaultValue,
  type = "text",
  required = true,
  readOnly = false,
  step,
  min,
  max,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        type={type}
        required={required}
        readOnly={readOnly}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
      />
    </label>
  );
}

export function FormSelectField({
  label,
  name,
  defaultValue,
  options,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} required={required}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormTextArea({
  label,
  name,
  defaultValue,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  onChange?: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="field field-full">
      <span>{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        rows={5}
      />
    </label>
  );
}
