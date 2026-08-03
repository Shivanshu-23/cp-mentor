import { NgModule, isDevMode } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { AnalysisComponent } from './features/analysis/analysis.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CompanyTrackerComponent } from './features/company-tracker/company-tracker.component';
import { PatternLibraryComponent } from './features/pattern-library/pattern-library.component';
import { PatternDetailComponent } from './features/pattern-library/pattern-detail.component';
import { ConstraintAnalyzerComponent } from './features/constraint-analyzer/constraint-analyzer.component';
import { SolveSessionListComponent } from './features/solve-session/solve-session-list.component';
import { SolveSessionWorksheetComponent } from './features/solve-session/solve-session-worksheet.component';
import { RecallDrillComponent } from './features/recall-drill/recall-drill.component';
import { ProgressDashboardComponent } from './features/progress-dashboard/progress-dashboard.component';

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

const routes: Routes = [
  { path: '', redirectTo: 'patterns', pathMatch: 'full' },
  ...devOnlyRoutes,
  { path: 'home', component: HomeComponent },
  { path: 'analysis/:id', component: AnalysisComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'company-tracker', component: CompanyTrackerComponent },
  { path: 'patterns', component: PatternLibraryComponent },
  { path: 'patterns/:slug', component: PatternDetailComponent },
  { path: 'constraint-analyzer', component: ConstraintAnalyzerComponent },
  // v2 Phase B/C — lazy per the spec's performance budget ("every visualizer
  // lazy-loaded on route"). Standalone, so it isn't pulled into AppModule's
  // eager bundle at all; only fetched when a user actually opens one.
  { path: 'visualize/:slug', loadComponent: () => import('./features/visualizer/visualizer-page.component').then(m => m.VisualizerPageComponent) },
  { path: 'solve', component: SolveSessionListComponent, canActivate: [AuthGuard] },
  { path: 'solve/:id', component: SolveSessionWorksheetComponent, canActivate: [AuthGuard] },
  { path: 'recall-drill', component: RecallDrillComponent, canActivate: [AuthGuard] },
  { path: 'progress', component: ProgressDashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'patterns' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
