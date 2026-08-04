// Barrel export for the frontend-static content layer. Typed TypeScript constants,
// not JSON fetched at runtime — a missing field is a compile error, not a blank
// section in production. See CLAUDE.md "Frontend-Static Content Layer" for the
// architectural decision this implements (supersedes v2 Phase E's backend-seeded
// method content for everything listed here).
export * from './method/phases';
export * from './method/complexity';
export * from './method/moves';
export * from './method/ladder';
export * from './method/recovery';
export * from './method/triggers';
export * from './method/edge-cases';
export * from './method/script';
export * from './method/worksheet';
export * from './method/candidate-techniques';
export * from './method/algorithm-identifier';
export * from './examples';
export * from './patterns';
