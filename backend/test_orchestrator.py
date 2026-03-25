import pytest

# -------------- STUB ORCHESTRATOR FOR TESTING --------------
# In a real LangGraph setup, this would be a compiled graph or agent router
class Orchestrator:
    @staticmethod
    def route_intent(prompt: str) -> str:
        prompt = prompt.lower()
        if "tax" in prompt:
            return "Tax Wizard Agent"
        elif "mutual fund" in prompt or "portfolio" in prompt or "mf" in prompt:
            return "MF X-Ray Agent"
        elif "retire" in prompt or "fire" in prompt or "corpus" in prompt:
            return "FIRE Planner Agent"
        else:
            return "General Support Agent"
# -------------------------------------------------------------

def test_orchestrator_routes_tax_queries():
    """Assert that tax-related queries route to the Tax Wizard Agent."""
    prompt = "How much tax will I save if I switch to the new regime?"
    route = Orchestrator.route_intent(prompt)
    assert route == "Tax Wizard Agent"

def test_orchestrator_routes_mf_queries():
    """Assert that mutual fund and portfolio queries route to the MF X-Ray Agent."""
    prompt = "Can you analyze my mutual funds for overlap?"
    route = Orchestrator.route_intent(prompt)
    assert route == "MF X-Ray Agent"

def test_orchestrator_routes_fire_queries():
    """Assert that retirement and FIRE queries route to the FIRE Planner Agent."""
    prompt = "When can I comfortably retire with my current SIPs?"
    route = Orchestrator.route_intent(prompt)
    assert route == "FIRE Planner Agent"

def test_orchestrator_fallback_routing():
    """Assert that general queries hit the default fallback agent."""
    prompt = "What features does AI Money Mentor have?"
    route = Orchestrator.route_intent(prompt)
    assert route == "General Support Agent"
