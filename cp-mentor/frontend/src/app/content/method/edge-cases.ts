// Source: "How to Analyse and Approach a DSA Problem", Phase 5 — Dry Run Before Submitting.
//
// Note: this is the universal dry-run checklist from the method document (also exported from
// phases.ts as DRY_RUN_CHECKLIST — re-exported here under the name this content module was
// specced under). It is deliberately NOT the input-type-specific edge-case generator
// (array/string/tree/graph/matrix/number flags) — that logic already exists server-side as
// EdgeCaseGeneratorService (POST /api/v1/method/edge-cases) and isn't duplicated here.

export { DRY_RUN_CHECKLIST as UNIVERSAL_EDGE_CASE_CHECKLIST } from './phases';
