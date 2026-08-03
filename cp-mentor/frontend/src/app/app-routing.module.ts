import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { AnalysisComponent } from './features/analysis/analysis.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CompanyTrackerComponent } from './features/company-tracker/company-tracker.component';
import { PatternLibraryComponent } from './features/pattern-library/pattern-library.component';
import { PatternDetailComponent } from './features/pattern-library/pattern-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'analysis/:id', component: AnalysisComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'company-tracker', component: CompanyTrackerComponent },
  { path: 'patterns', component: PatternLibraryComponent },
  { path: 'patterns/:slug', component: PatternDetailComponent },
  { path: '**', redirectTo: 'home' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
