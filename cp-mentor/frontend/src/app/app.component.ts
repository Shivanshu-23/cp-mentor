import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { KeyboardShortcutsService } from './core/services/keyboard-shortcuts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  private hasNavigated = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private keyboardShortcuts: KeyboardShortcutsService
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$().subscribe(v => {
      this.isLoggedIn = v;
      const user = this.authService.getUser();
      this.username = user?.username ?? '';
    });
    this.keyboardShortcuts.init();

    // "Thwip" — a quick web-strand shoots across the screen on every page
    // transition, like swinging to the next page. Skip the very first
    // NavigationEnd (initial load) so it only fires on real navigation.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      if (this.hasNavigated) this.fireThwip();
      this.hasNavigated = true;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private fireThwip(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fromRight = Math.random() < 0.5;
    const x1 = fromRight ? window.innerWidth + 20 : -20;
    const y1 = -20;
    const x2 = window.innerWidth * (0.35 + Math.random() * 0.3);
    const y2 = window.innerHeight * (0.25 + Math.random() * 0.3);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('thwip-overlay');
    svg.setAttribute('aria-hidden', 'true');

    const line = document.createElementNS(svgNS, 'line');
    line.classList.add('thwip-strand');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    const len = Math.hypot(x2 - x1, y2 - y1);
    line.style.strokeDasharray = `${len}`;
    line.style.strokeDashoffset = `${len}`;

    const impact = document.createElementNS(svgNS, 'circle');
    impact.classList.add('thwip-impact');
    impact.setAttribute('cx', String(x2));
    impact.setAttribute('cy', String(y2));
    impact.setAttribute('r', '3');

    svg.appendChild(line);
    svg.appendChild(impact);
    document.body.appendChild(svg);

    setTimeout(() => svg.remove(), 500);
  }
}
