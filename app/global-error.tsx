"use client";

const copy = {
  code: "500",
  title: "Nutaraline is unavailable",
  body: "The application hit an unrecoverable error while rendering.",
  hint: "Reload the page. If the problem continues, contact support.",
  retry: "Reload",
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d110d",
          color: "#e8ede8",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontSize: 64, fontWeight: 700, margin: 0 }}>{copy.code}</p>
          <h1 style={{ fontSize: 20, marginTop: 8 }}>{copy.title}</h1>
          <p style={{ color: "#9bac9b", fontSize: 14, lineHeight: 1.6 }}>
            {copy.body}
          </p>
          <p style={{ color: "#6e806e", fontSize: 12 }}>{copy.hint}</p>
          {error.digest ? (
            <p style={{ color: "#6e806e", fontSize: 11 }}>
              Request ID: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 40,
              padding: "0 16px",
              borderRadius: 6,
              border: "none",
              background: "#39873d",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {copy.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
