"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap ph" role="alert">
      <h1>
        Error<em>.</em>
      </h1>
      <button type="button" className="btn" onClick={reset}>
        ↻
      </button>
    </div>
  );
}
