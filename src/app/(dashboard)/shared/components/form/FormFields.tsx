"use client";

export function FormField({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue} type={type} required />
    </label>
  );
}

export function FormSelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue}>
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
}: {
  label: string;
  name: string;
  defaultValue: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="field field-full">
      <span>{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        rows={5}
      />
    </label>
  );
}
