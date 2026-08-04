import { NgModule, isDevMode } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

// /styleguide is a dev-only design-token reference (Phase A). It's lazy-loaded
// (loadComponent, standalone) so it ships as its own chunk, and the route is
// only registered when isDevMode() is true — in a `ng build --configuration
// production` bundle the route is unreachable via the router. The chunk file
// itself still gets emitted to disk (Angular can't know at build time that
// the runtime check will always be false in prod); true zero-file exclusion
// would need the environment/fileReplacements system, which this codebase
// doesn't otherwise use — see CLAUDE.md.
const devOnlyRoutes: Routes = isDevMode()
  ? [{ path: 'styleguide', loadComponent: () => import('./dev/styleguide/styleguide.component').then(m => m.StyleguideComponent) }]
  : [];

// Every feature route below is standalone + loadComponent — the whole app
// used to be declared eagerly in AppModule (~980KB raw / ~372KB gzipped
// initial bundle, the root cause of a 73 Lighthouse Performance score on
// /method-guide). Converting every route to lazy-loaded standalone
// components, matching the pattern already used for visualize/:slug,
// method-guide, and styleguide, is what actually shrinks the initial
// payload — AppModule now only declares the app shell. See CLAUDE.md.
const routes: Routes = [
  { path: '', redirectTo: 'yodh', pathMatch: 'full' },
  ...devOnlyRoutes,
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'analysis/:id', loadComponent: () => import('./features/analysis/analysis.component').then(m => m.AnalysisComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  { path: 'company-tracker', loadComponent: () => import('./features/company-tracker/company-tracker.component').then(m => m.CompanyTrackerComponent) },
  { path: 'patterns', loadComponent: () => import('./features/pattern-library/pattern-library.component').then(m => m.PatternLibraryComponent) },
  { path: 'patterns/:slug', loadComponent: () => import('./features/pattern-library/pattern-detail.component').then(m => m.PatternDetailComponent) },
  { path: 'constraint-analyzer', loadComponent: () => import('./features/constraint-analyzer/constraint-analyzer.component').then(m => m.ConstraintAnalyzerComponent) },
  { path: 'visualize/:slug', loadComponent: () => import('./features/visualizer/visualizer-page.component').then(m => m.VisualizerPageComponent) },
  // The "How to Analyse and Approach a DSA Problem" method guide — a long,
  // purely static reference page, standalone + lazy for the same reason.
  // Public, no AuthGuard.
  { path: 'method-guide', loadComponent: () => import('./features/method-guide/method-guide.component').then(m => m.MethodGuideComponent) },
  // Surfaces Phase E's already-seeded TopicPriority data, which never had a
  // consumer page before this (see CLAUDE.md). Public, no AuthGuard —
  // completion is tracked client-side only.
  { path: 'curriculum', loadComponent: () => import('./features/curriculum/curriculum.component').then(m => m.CurriculumComponent) },
  // Yodh — the method text plus the Constraint Analyzer and Recall Drill
  // embedded live on the same page, plus a fillable worksheet that commits
  // to GitHub. Public, no AuthGuard — the embedded Recall Drill handles its
  // own signed-out state instead of gating the whole page.
  { path: 'yodh', loadComponent: () => import('./features/yodh/yodh.component').then(m => m.YodhComponent) },
  { path: 'mock-interview', loadComponent: () => import('./features/mock-interview/mock-interview.component').then(m => m.MockInterviewComponent), canActivate: [AuthGuard] },
  { path: 'bookmarks', loadComponent: () => import('./features/bookmarks/bookmarks.component').then(m => m.BookmarksComponent), canActivate: [AuthGuard] },
  { path: 'solve', loadComponent: () => import('./features/solve-session/solve-session-list.component').then(m => m.SolveSessionListComponent), canActivate: [AuthGuard] },
  { path: 'solve/:id', loadComponent: () => import('./features/solve-session/solve-session-worksheet.component').then(m => m.SolveSessionWorksheetComponent), canActivate: [AuthGuard] },
  { path: 'recall-drill', loadComponent: () => import('./features/recall-drill/recall-drill.component').then(m => m.RecallDrillComponent), canActivate: [AuthGuard] },
  { path: 'progress', loadComponent: () => import('./features/progress-dashboard/progress-dashboard.component').then(m => m.ProgressDashboardComponent), canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'yodh' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
