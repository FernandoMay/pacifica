import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Smoke test", () => {
  it("renders a basic element", () => {
    render(<div data-testid="smoke">Hello from Pacifica</div>);
    expect(screen.getByTestId("smoke")).toHaveTextContent("Hello from Pacifica");
  });
});
