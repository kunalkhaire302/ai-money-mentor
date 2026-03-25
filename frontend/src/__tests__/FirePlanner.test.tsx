import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FirePlannerPage from "@/app/fire-planner/page";

// Mock intersection observer for Framer Motion
beforeAll(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  }));
});

global.fetch = jest.fn() as jest.Mock;

describe("FirePlanner Component", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders FIRE Planner and projects corpus", async () => {
    // Render the component
    render(<FirePlannerPage />);
    
    expect(screen.getByText(/FIRE Planner/i)).toBeInTheDocument();
    
    // Mock successful backend API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        fire_target_crores: 4.5,
        fire_reached_age: 42,
        years_to_fire: 14,
        wealth_multiplier: 3.2,
        monthly_passive_income: 150000,
        total_invested: 2000000,
        wealth_gain: 4000000,
        final_corpus_crores: 6.0,
        projections: [
            { age: 28, corpus_crores: 0.1, fire_target_crores: 1.5 },
            { age: 35, corpus_crores: 1.5, fire_target_crores: 2.5 },
            { age: 45, corpus_crores: 6.0, fire_target_crores: 4.5 }
        ],
        milestones: [
            { age: 33, label: "First 1Cr", corpus_crores: 1.0 },
            { age: 42, label: "🔥 FIRE!", corpus_crores: 4.5 }
        ],
        disclaimer: "AI Analysis"
      }),
    });

    const submitBtn = screen.getByRole("button", { name: /Calculate FIRE Plan/i });
    fireEvent.click(submitBtn);

    // Assert visualizations and data map into the DOM
    await waitFor(() => {
      expect(screen.getByText(/Corpus Growth Projection/i)).toBeInTheDocument();
      // Assert milestone rendering
      expect(screen.getByText(/First 1Cr/i)).toBeInTheDocument();
      expect(screen.getByText(/🔥 FIRE!/i)).toBeInTheDocument();
    });
  });
});
