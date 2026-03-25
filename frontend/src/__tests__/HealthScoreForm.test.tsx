import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HealthScorePage from "@/app/health-score/page";

// Mock intersection observer for Framer Motion
beforeAll(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  }));
});

// Mock recharts responsive container
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: {children: any}) => (
      <div style={{ width: "100%", height: 300 }}>{children}</div>
    ),
  };
});

global.fetch = jest.fn() as jest.Mock;

describe("HealthScore Form", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("completes the multi-step form and renders SHAP and Radar charts", async () => {
    render(<HealthScorePage />);
    
    // Step 1: Demographics
    expect(screen.getByText(/Demographics/i)).toBeInTheDocument();
    
    // Click Next 3 times to reach the end of the form
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i })); // to Income
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i })); // to Debt
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i })); // to Investments

    // Assert we reached Investments
    expect(screen.getByText(/Investments/i)).toBeInTheDocument();
    
    // Mock the backend API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        score: 75.5,
        tier: "Good",
        radar_data: [
          { axis: "Income", score: 80, benchmark: 100 },
          { axis: "Savings Rate", score: 70, benchmark: 100 }
        ],
        top_positive_factors: [
          { feature: "high_savings", impact: 12.5 }
        ],
        top_negative_factors: [
          { feature: "low_emergency_fund", impact: -5.2 }
        ],
        recommendations: ["Build emergency fund"]
      }),
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /Get My Score/i });
    fireEvent.click(submitBtn);

    // Wait for Results
    await waitFor(() => {
      // Assert Score is present
      expect(screen.getByText(/75.5/i)).toBeInTheDocument();
      expect(screen.getByText(/Good/i)).toBeInTheDocument();
    });

    // Assert SHAP features render
    expect(screen.getByText(/low_emergency_fund/i)).toBeInTheDocument();
    expect(screen.getByText(/-5.2 pts/i)).toBeInTheDocument();
  });
});
