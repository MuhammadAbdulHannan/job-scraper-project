import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm.jsx";
import RunProgress from "./components/RunProgress.jsx";
import { startScrape, fetchJobStatus } from "./helpers/apiHelpers.js";
import { isRunning } from "./helpers/formatHelpers.js";
import { POLL_INTERVAL_MS } from "./constants/statusConstants.js";

export default function App() {
  const [jobId, setJobId] = useState(() =>
    new URLSearchParams(window.location.search).get("job"),
  );
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [prefill, setPrefill] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const next = await fetchJobStatus(jobId);
        if (cancelled) return;
        setStatus(next);
        if (isRunning(next.status)) setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        if (!cancelled) setSubmitError(error.message);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await startScrape(values);
      setJobId(result.jobId);
      window.history.replaceState(null, "", `?job=${result.jobId}`);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (status?.inputs) setPrefill(status.inputs);
    setJobId(null);
    setStatus(null);
    setSubmitError("");
    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <main className="shell">
      {jobId ? (
        <RunProgress jobId={jobId} status={status} onReset={handleReset} />
      ) : (
        <SearchForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
          initialValues={prefill}
        />
      )}
    </main>
  );
}
