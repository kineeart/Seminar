"""Chuong 16 demo: decision helper for GenAI adoption in software engineering.

Script nay minh hoa cach bien cac luan diem kien truc/gov trong chuong 16
thanh quyet dinh co cau truc.
"""

from dataclasses import dataclass


@dataclass
class ProjectProfile:
    architecture_complexity: int  # 1..5
    regulatory_pressure: int  # 1..5
    legacy_burden: int  # 1..5
    team_maturity: int  # 1..5


def clamp_score(value: int) -> int:
    return max(1, min(5, value))


def adoption_score(profile: ProjectProfile) -> float:
    """Return a normalized adoption score in [0, 100].

    Higher score means easier/safer to expand GenAI-assisted delivery quickly.
    """
    complexity = clamp_score(profile.architecture_complexity)
    regulatory = clamp_score(profile.regulatory_pressure)
    legacy = clamp_score(profile.legacy_burden)
    maturity = clamp_score(profile.team_maturity)

    # Positive driver: team maturity.
    # Friction factors: complexity, regulatory constraints, and legacy burden.
    raw = (maturity * 25) - (complexity * 10 + regulatory * 8 + legacy * 7)
    score = max(0, min(100, raw + 50))
    return float(score)


def recommend_focus_areas(profile: ProjectProfile) -> list[str]:
    """Map project profile into prioritized SWEBOK-aligned focus areas."""
    score = adoption_score(profile)

    if score >= 70:
        return [
            "Scale AI-assisted software construction",
            "Automate unit testing generation and maintenance",
            "Invest in architecture-level copilots and design assistants",
        ]

    if score >= 45:
        return [
            "Constrain AI usage to implementation + test scaffolding",
            "Enforce mandatory human review for architecture-touching changes",
            "Strengthen quality gates before broad rollout",
        ]

    return [
        "Use GenAI mainly for documentation and code comprehension",
        "Run controlled pilot in low-risk modules",
        "Prioritize governance, auditability, and legacy risk reduction",
    ]


def governance_gates(profile: ProjectProfile) -> list[str]:
    """Return required gates based on risk sensitivity."""
    gates = [
        "Trace prompt/session metadata in pull request template",
        "Require unit tests for all AI-generated production code",
        "Block merge on high-severity security findings",
    ]

    if profile.regulatory_pressure >= 4:
        gates.append("Add compliance sign-off for regulated workflows")
        gates.append("Store model/version provenance for audit")

    if profile.legacy_burden >= 4:
        gates.append("Require diff-based regression tests on legacy boundaries")

    if profile.architecture_complexity >= 4:
        gates.append("Require senior architecture review before merge")

    return gates


def staffing_implication(profile: ProjectProfile) -> str:
    """Summarize human role shift suggested by Chapter 16."""
    if profile.team_maturity >= 4 and profile.architecture_complexity >= 4:
        return (
            "Favor senior-heavy team composition: leverage GenAI for speed, "
            "while senior engineers own architecture and integration risk."
        )

    if profile.team_maturity <= 2:
        return (
            "Invest first in mentoring and review discipline; GenAI boosts "
            "output volume quickly, so quality oversight must scale first."
        )

    return (
        "Build mixed teams: juniors use GenAI for implementation throughput, "
        "seniors guard system boundaries and governance."
    )


def print_report(profile: ProjectProfile) -> None:
    print("=== Chapter 16 - GenAI Adoption Decision Report ===")
    print(f"Adoption score: {adoption_score(profile):.1f}/100")

    print("\nPriority focus areas:")
    for idx, area in enumerate(recommend_focus_areas(profile), start=1):
        print(f"{idx}. {area}")

    print("\nRequired governance gates:")
    for idx, gate in enumerate(governance_gates(profile), start=1):
        print(f"{idx}. {gate}")

    print("\nStaffing implication:")
    print(staffing_implication(profile))


def main() -> None:
    # Sample profile for demonstration; adjust values for your own case study.
    sample = ProjectProfile(
        architecture_complexity=4,
        regulatory_pressure=3,
        legacy_burden=4,
        team_maturity=4,
    )
    print_report(sample)


if __name__ == "__main__":
    main()
