import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaxWizardPage from "@/app/tax-wizard/page";

// Mock intersection observer for Framer Motion
beforeAll(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  }));
});

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe("TaxWizard Component", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders the Tax Wizard form and submits data", async () => {
    // Render the component
    render(<TaxWizardPage />);
    
    // Check if header is present
    expect(screen.getByText(/Tax Wizard/i)).toBeInTheDocument();
    
    // Find the Gross Income input field
    const incomeInput = screen.getByLabelText(/Gross Annual Income/i);
    expect(incomeInput).toBeInTheDocument();
    
    // Change value to 12 LPA
    fireEvent.change(incomeInput, { target: { value: "1200000" } });
    
    // Mock the backend API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        gross_income: 1200000,
        old_regime: {
          total_deductions: 100000,
          taxable_income: 1100000,
          tax_payable: 148200,
          deduction_breakdown: []
        },
        new_regime: {
          standard_deduction: 75000,
          taxable_income: 1125000,
          tax_payable: 98800,
        },
        savings: 49400,
        recommended_regime: "New Regime",
        potential_annual_savings: 49400,
        disclaimer: "AI Analysis"
      }),
    });

    // Click Compute button
    const computeButton = screen.getByRole("button", { name: /Compare Regimes/i });
    fireEvent.click(computeButton);

    // Wait for the result to render
    await waitFor(() => {
      expect(screen.getByText(/New Regime is Better/i)).toBeInTheDocument();
    });

    // Verify savings formatting
    expect(screen.getByText(/₹49,400/i)).toBeInTheDocument();
    
    // Verify Chart rendering (ResponsiveContainer mock should be present)
    expect(screen.getByText(/Tax Comparison/i)).toBeInTheDocument();
  });
});
