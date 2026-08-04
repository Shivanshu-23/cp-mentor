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

    // An arrow flies in and lands on every page transition, like Drona's own
    // discipline: aim, release, land. Skip the very first NavigationEnd
    // (initial load) so it only fires on real navigation.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      if (this.hasNavigated) this.fireArrowShot();
      this.hasNavigated = true;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private fireArrowShot(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fromRight = Math.random() < 0.5;
    const x1 = fromRight ? window.innerWidth + 20 : -20;
    const y1 = -20;
    const x2 = window.innerWidth * (0.35 + Math.random() * 0.3);
    const y2 = window.innerHeight * (0.25 + Math.random() * 0.3);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('arrow-shot-overlay');
    svg.setAttribute('aria-hidden', 'true');

    const shaft = document.createElementNS(svgNS, 'line');
    shaft.classList.add('arrow-shot-shaft');
    shaft.setAttribute('x1', String(x1));
    shaft.setAttribute('y1', String(y1));
    shaft.setAttribute('x2', String(x2));
    shaft.setAttribute('y2', String(y2));
    const len = Math.hypot(x2 - x1, y2 - y1);
    shaft.style.strokeDasharray = `${len}`;
    shaft.style.strokeDashoffset = `${len}`;

    const head = document.createElementNS(svgNS, 'polygon');
    head.classList.add('arrow-shot-head');
    head.setAttribute('points', '0,-4 10,0 0,4');
    head.setAttribute('transform', `translate(${x2}, ${y2}) rotate(${angle})`);

    const impact = document.createElementNS(svgNS, 'circle');
    impact.classList.add('arrow-shot-impact');
    impact.setAttribute('cx', String(x2));
    impact.setAttribute('cy', String(y2));
    impact.setAttribute('r', '3');

    svg.appendChild(shaft);
    svg.appendChild(head);
    svg.appendChild(impact);
    document.body.appendChild(svg);

    setTimeout(() => svg.remove(), 500);
  }
}
