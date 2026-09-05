import { useEffect, useState } from "react";
import {
  PIPELINE_STAGES,
  STAGE_STATE,
  EXPORT_FORMATS,
  JOB_STATUS,
} from "../constants/statusConstants.js";
import { getStageState, formatElapsed } from "../helpers/formatHelpers.js";
import { buildDownloadUrl } from "../helpers/apiHelpers.js";

export default function RunProgress({ jobId, status, onReset }) {
  const [elapsed, setElapsed] = useState("0s");

  const isReady = status?.status === JOB_STATUS.READY;
  const isFailed = status?.status === JOB_STATUS.FAILED;
  const isEmpty = status?.status === JOB_STATUS.EMPTY;
  const isFinished = isReady || isFailed || isEmpty;

  useEffect(() => {
    if (!status?.createdAt) return;

    if (isFinished) {
      setElapsed(formatElapsed(status.createdAt, status.updatedAt));
      return;
    }

    setElapsed(formatElapsed(status.createdAt));
    const timer = setInterval(
      () => setElapsed(formatElapsed(status.createdAt)),
      1000,
    );
    return () => clearInterval(timer);
  }, [status?.createdAt, status?.updatedAt, isFinished]);

  if (!status) return null;

  return (
    <div className="panel">
      <header className="panel-head run-head">
        <div>
          <h1>
            {isFailed
              ? "Search failed"
              : isEmpty
                ? "No contacts found"
                : isReady
                  ? "Your list is ready"
                  : "Building your list"}
          </h1>
          <p>
            {isFailed
              ? status.error
              : `Run ${jobId.slice(0, 8)} · ${isReady ? "finished" : elapsed}`}
          </p>
        </div>
        <button className="ghost" type="button" onClick={onReset}>
          New search
        </button>
      </header>

      {status.inputs && (
        <dl className="run-params">
          <div>
            <dt>Job titles</dt>
            <dd>{status.inputs.keywords?.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{status.inputs.location || "Anywhere"}</dd>
          </div>
          <div>
            <dt>Job boards</dt>
            <dd>{status.inputs.platforms?.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt>Company size</dt>
            <dd>
              {status.inputs.employeeCountMin}–{status.inputs.employeeCountMax}{" "}
              employees
            </dd>
          </div>
          <div>
            <dt>Listings per title</dt>
            <dd>{status.inputs.jobsPerKeyword}</dd>
          </div>
          <div className="wide">
            <dt>Looking for</dt>
            <dd>{status.inputs.personaTitles?.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt>Contact details</dt>
            <dd>
              {[
                status.inputs.needEmail && "emails",
                status.inputs.needPhone && "mobile numbers",
              ]
                .filter(Boolean)
                .join(" + ") || "none"}
            </dd>
          </div>
        </dl>
      )}

      {!isFailed && (
        <ol className="stages">
          {PIPELINE_STAGES.map((stage) => {
            const state = getStageState(stage.status, status.status);
            const count = stage.countKey ? status[stage.countKey] : null;
            const showCount =
              state !== STAGE_STATE.WAITING &&
              count !== null &&
              count !== undefined;

            return (
              <li key={stage.status} className={`stage is-${state}`}>
                <span className="stage-dot" aria-hidden="true" />
                <span className="stage-label">{stage.label}</span>
                {showCount && (
                  <span className="stage-count">
                    {count} <em>{stage.countLabel}</em>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {isEmpty && (
        <>
          <p className="banner-error">{status.emptyReason}</p>
          <button className="primary" type="button" onClick={onReset}>
            Try a different search
          </button>
        </>
      )}
      {isReady && (
        <>
          <div className="totals">
            <div>
              <strong>{status.contactsCount}</strong>
              <span>contacts</span>
            </div>
            <div>
              <strong>{status.emailsFound}</strong>
              <span>emails</span>
            </div>
            <div>
              <strong>{status.phonesFound}</strong>
              <span>mobile numbers</span>
            </div>
          </div>

          <div className="download-row">
            {EXPORT_FORMATS.map((format, index) => (
              <a
                key={format.value}
                className={index === 0 ? "primary" : "ghost"}
                href={buildDownloadUrl(jobId, format.value)}
              >
                Download {format.label}
              </a>
            ))}
          </div>
        </>
      )}

      {isFailed && (
        <button className="primary" type="button" onClick={onReset}>
          Start over
        </button>
      )}
    </div>
  );
}
