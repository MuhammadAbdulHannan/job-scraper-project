import { useState } from "react";

export default function TagInput({
  label,
  hint,
  values,
  onChange,
  placeholder,
  suggestions = [],
  error,
}) {
  const [draft, setDraft] = useState("");

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase();
    if (!tag || values.includes(tag)) return;
    onChange([...values, tag]);
    setDraft("");
  };

  const removeTag = (tag) => onChange(values.filter((item) => item !== tag));

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }
    if (event.key === "Backspace" && !draft && values.length) {
      removeTag(values[values.length - 1]);
    }
  };

  const unusedSuggestions = suggestions.filter(
    (item) => !values.includes(item),
  );

  return (
    <div className="field">
      <label className="field-label" htmlFor={`tag-${label}`}>
        {label}
      </label>
      {hint && <p className="field-hint">{hint}</p>}

      <div className={`tag-box ${error ? "has-error" : ""}`}>
        {values.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={`tag-${label}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={values.length ? "" : placeholder}
        />
      </div>

      {unusedSuggestions.length > 0 && (
        <div className="suggestions">
          {unusedSuggestions.map((item) => (
            <button type="button" key={item} onClick={() => addTag(item)}>
              + {item}
            </button>
          ))}
        </div>
      )}

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
