import { useState } from "react";
import TagInput from "./TagInput.jsx";
import {
  PLATFORMS,
  DEFAULT_FORM_VALUES,
  JOBS_PER_KEYWORD_OPTIONS,
  SUGGESTED_PERSONA_TITLES,
  FIELD_HINTS,
} from "../constants/searchConstants.js";
import { validateForm } from "../helpers/formatHelpers.js";

export default function SearchForm({ onSubmit, isSubmitting, submitError }) {
  const [values, setValues] = useState(DEFAULT_FORM_VALUES);
  const [errors, setErrors] = useState({});

  const setField = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const togglePlatform = (platform) => {
    setValues((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((item) => item !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = () => {
    const found = validateForm(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit(values);
  };

  return (
    <div className="panel">
      <header className="panel-head">
        <h1>Find contacts at hiring companies</h1>
        <p>
          Scrape job listings, drop the staffing agencies, and get
          decision-makers at what's left.
        </p>
      </header>

      <TagInput
        label="Job titles to search"
        hint={FIELD_HINTS.keywords}
        values={values.keywords}
        onChange={(next) => setField("keywords", next)}
        placeholder="software engineer, data engineer…"
        error={errors.keywords}
      />

      <div className="field">
        <label className="field-label" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          className="text-input"
          value={values.location}
          onChange={(event) => setField("location", event.target.value)}
          placeholder="California"
        />
      </div>

      <div className="field">
        <span className="field-label">Job boards</span>
        <div className="choice-row">
          {PLATFORMS.map((platform) => (
            <button
              type="button"
              key={platform.value}
              className={`choice ${values.platforms.includes(platform.value) ? "is-on" : ""}`}
              onClick={() => togglePlatform(platform.value)}
            >
              {platform.label}
            </button>
          ))}
        </div>
        {errors.platforms && <p className="field-error">{errors.platforms}</p>}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="jobsPerKeyword">
            Listings per keyword
          </label>
          <select
            id="jobsPerKeyword"
            className="text-input"
            value={values.jobsPerKeyword}
            onChange={(event) =>
              setField("jobsPerKeyword", Number(event.target.value))
            }
          >
            {JOBS_PER_KEYWORD_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="field-label">Company size</span>
          <div className="range-row">
            <input
              type="number"
              className="text-input"
              value={values.employeeCountMin}
              onChange={(event) =>
                setField("employeeCountMin", Number(event.target.value))
              }
              aria-label="Minimum employees"
            />
            <span className="range-dash">to</span>
            <input
              type="number"
              className="text-input"
              value={values.employeeCountMax}
              onChange={(event) =>
                setField("employeeCountMax", Number(event.target.value))
              }
              aria-label="Maximum employees"
            />
          </div>
          {errors.employeeCount && (
            <p className="field-error">{errors.employeeCount}</p>
          )}
        </div>
      </div>

      <p className="field-hint standalone">{FIELD_HINTS.employeeCount}</p>

      <TagInput
        label="Who to find at each company"
        hint={FIELD_HINTS.personaTitles}
        values={values.personaTitles}
        onChange={(next) => setField("personaTitles", next)}
        placeholder="vp of sales, hiring manager…"
        suggestions={SUGGESTED_PERSONA_TITLES}
        error={errors.personaTitles}
      />

      <div className="field">
        <span className="field-label">Contact details to look up</span>
        <label className="check">
          <input
            type="checkbox"
            checked={values.needEmail}
            onChange={(event) => setField("needEmail", event.target.checked)}
          />
          <span>Verified email addresses</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={values.needPhone}
            onChange={(event) => setField("needPhone", event.target.checked)}
          />
          <span>Mobile numbers</span>
          <em>{FIELD_HINTS.needPhone}</em>
        </label>
      </div>

      {submitError && <p className="banner-error">{submitError}</p>}

      <button
        className="primary"
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Starting…" : "Start search"}
      </button>
    </div>
  );
}
