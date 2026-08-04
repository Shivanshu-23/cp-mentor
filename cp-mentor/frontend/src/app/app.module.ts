import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Angular Material — only what AppComponent's own template (the navbar
// shell) needs. Every feature route now brings its own Material imports as
// a standalone component (loadComponent in app-routing.module.ts) — see
// CLAUDE.md "Frontend-Static Content Layer + SSR/Prerendering" for why this
// module used to declare everything eagerly and what changed.
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { CommandPaletteComponent } from './shared/command-palette/command-palette.component';
import { HelpOverlayComponent } from './shared/command-palette/help-overlay.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    // Standalone components consumed by AppComponent's own template
    // (always-visible, so eagerly imported rather than lazy).
    CommandPaletteComponent,
    HelpOverlayComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
