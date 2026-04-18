# Drill / Quiz Executive Remediation Roadmap

## 1. Summary of Highest Risks
The Drill system is functional but faces two major risks:
1. **User Churn Risk**: Perceived lag during results reveal and feedback loops may lead students to believe the app is broken.
2. **Data Integrity Risk**: Loose Zod schemas and missing DB constraints could lead to malformed study history which is difficult to repair.

## 2. Priority 0: Immediate Fixes (Critical for Trust & Maintenance)
- **R-001**: Parallelize `endSession` DB writes to reduce latency.
- **R-002**: Add stage indicators to the `CalculatingResultsOverlay`.
- **R-003**: Tighten Zod schemas for CAGE behavioral data.
- **R-009**: **Absolute Unification**: Align Database Enums, Table Names, and Column Names with the canonical underscored mode keys to remove the mapping debt.

## 3. Priority 1: UX & Schema Stability
- **R-004**: Implement a "Saving..." indicator in the Quiz Shell.
- **R-005**: Add DB-level `CHECK` constraints for accuracy and scores.
- **R-006**: Improve visual feedback for the "Gated Delay" timer.

## 4. Priority 2: Technical Debt Cleanup
- **R-007**: Canonicalize mode names across UI/Action/DB.
- **R-008**: Implement a dedicated "Invalid Session" error page.

## 5. Decision Points
- **Delay Confirmation**: Decide if `fullexam` results should remain gated by 24h or if this should be a user-configurable setting.
- **CAGE Strictness**: Determine the impact of strict CAGE validation on mobile users with high latency/jitter.
