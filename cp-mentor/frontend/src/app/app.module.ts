import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Features
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { AnalysisComponent } from './features/analysis/analysis.component';
import { CompanyTrackerComponent } from './features/company-tracker/company-tracker.component';
import { PatternLibraryComponent } from './features/pattern-library/pattern-library.component';
import { PatternDetailComponent } from './features/pattern-library/pattern-detail.component';
import { ConstraintAnalyzerComponent } from './features/constraint-analyzer/constraint-analyzer.component';
import { SolveSessionListComponent } from './features/solve-session/solve-session-list.component';
import { SolveSessionWorksheetComponent } from './features/solve-session/solve-session-worksheet.component';
import { RecallDrillComponent } from './features/recall-drill/recall-drill.component';
import { ProgressDashboardComponent } from './features/progress-dashboard/progress-dashboard.component';
import { TiltDirective } from './shared/tilt.directive';
import { CommandPaletteComponent } from './shared/command-palette/command-palette.component';
import { HelpOverlayComponent } from './shared/command-palette/help-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    AnalysisComponent,
    CompanyTrackerComponent,
    PatternLibraryComponent,
    PatternDetailComponent,
    ConstraintAnalyzerComponent,
    SolveSessionListComponent,
    SolveSessionWorksheetComponent,
    RecallDrillComponent,
    ProgressDashboardComponent,
    TiltDirective,
    CommandPaletteComponent,
    HelpOverlayComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
