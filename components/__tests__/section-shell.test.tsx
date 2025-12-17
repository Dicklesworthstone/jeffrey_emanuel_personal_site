import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionShell from "../section-shell";
import { Zap } from "lucide-react";

// Mock the intersection observer hook
vi.mock("@/hooks/use-intersection-observer", () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isIntersecting: true,
  }),
}));

describe("SectionShell", () => {
  it("renders with required props", () => {
    render(
      <SectionShell title="Test Title">
        <div>Test children</div>
      </SectionShell>
    );

    expect(screen.getByRole("heading", { name: "Test Title" })).toBeInTheDocument();
    expect(screen.getByText("Test children")).toBeInTheDocument();
  });

  it("renders h2 by default", () => {
    render(
      <SectionShell title="Default Heading">
        <div>Content</div>
      </SectionShell>
    );

    const heading = screen.getByRole("heading", { name: "Default Heading" });
    expect(heading.tagName).toBe("H2");
  });

  it("renders h1 when headingLevel is 1", () => {
    render(
      <SectionShell title="Main Heading" headingLevel={1}>
        <div>Content</div>
      </SectionShell>
    );

    const heading = screen.getByRole("heading", { name: "Main Heading" });
    expect(heading.tagName).toBe("H1");
  });

  it("renders eyebrow text when provided", () => {
    render(
      <SectionShell title="Title" eyebrow="Test Eyebrow">
        <div>Content</div>
      </SectionShell>
    );

    expect(screen.getByText("Test Eyebrow")).toBeInTheDocument();
  });

  it("renders kicker text when provided", () => {
    render(
      <SectionShell title="Title" kicker="This is a description">
        <div>Content</div>
      </SectionShell>
    );

    expect(screen.getByText("This is a description")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <SectionShell title="Title" icon={Zap}>
        <div>Content</div>
      </SectionShell>
    );

    // Icon should be rendered - check for the container
    const iconContainer = document.querySelector(".rounded-2xl");
    expect(iconContainer).toBeInTheDocument();
  });

  it("renders custom iconNode when provided", () => {
    render(
      <SectionShell title="Title" iconNode={<span data-testid="custom-icon">Custom</span>}>
        <div>Content</div>
      </SectionShell>
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("sets id on section and heading", () => {
    render(
      <SectionShell title="Title" id="test-section">
        <div>Content</div>
      </SectionShell>
    );

    const section = document.getElementById("test-section");
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe("SECTION");

    const heading = screen.getByRole("heading", { name: "Title" });
    expect(heading).toHaveAttribute("id", "test-section-heading");
  });

  it("applies aria-labelledby to section", () => {
    render(
      <SectionShell title="Title" id="aria-test">
        <div>Content</div>
      </SectionShell>
    );

    const section = document.getElementById("aria-test");
    expect(section).toHaveAttribute("aria-labelledby", "aria-test-heading");
  });

  it("applies custom className", () => {
    render(
      <SectionShell title="Title" className="custom-class">
        <div>Content</div>
      </SectionShell>
    );

    const section = document.querySelector("section");
    expect(section).toHaveClass("custom-class");
  });

  it("renders children correctly", () => {
    render(
      <SectionShell title="Title">
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </SectionShell>
    );

    expect(screen.getByText("First paragraph")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph")).toBeInTheDocument();
  });
});
