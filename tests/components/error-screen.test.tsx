import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorScreen } from "@/components/errors/error-screen";
import { getDictionaryFor } from "@/lib/i18n";

const dict = getDictionaryFor("en");

function renderScreen(
  overrides: Partial<Parameters<typeof ErrorScreen>[0]> = {},
) {
  return render(
    <ErrorScreen
      code={500}
      tone="error"
      title="Internal error"
      body="Something failed on our side."
      hint="Retry once."
      dict={dict}
      {...overrides}
    />,
  );
}

describe("ErrorScreen", () => {
  it("shows the status code", () => {
    renderScreen();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("renders title, body, and hint", () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: "Internal error" })).toBeInTheDocument();
    expect(screen.getByText("Something failed on our side.")).toBeInTheDocument();
    expect(screen.getByText("Retry once.")).toBeInTheDocument();
  });

  it("shows 'unknown' instead of a number for unresolved errors", () => {
    renderScreen({ code: "unknown" });
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("always offers a route back to monitoring", () => {
    renderScreen();
    expect(
      screen.getByRole("link", { name: dict.errorPages.backToMonitoring }),
    ).toHaveAttribute("href", "/monitoring");
  });

  it("omits the retry button when no handler is provided", () => {
    renderScreen();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("invokes the retry handler", async () => {
    const onRetry = vi.fn();
    renderScreen({ onRetry });

    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders the request id when present", () => {
    renderScreen({ requestId: "req_abc123" });
    expect(screen.getByText(/req_abc123/)).toBeInTheDocument();
  });

  it("hides the request id when absent", () => {
    renderScreen();
    expect(screen.queryByText(/Request ID/)).toBeNull();
  });

  it("uses an alert role only for error tone", () => {
    const { container: errorContainer } = renderScreen();
    expect(errorContainer.querySelector('[role="alert"]')).toBeInTheDocument();
  });
});
