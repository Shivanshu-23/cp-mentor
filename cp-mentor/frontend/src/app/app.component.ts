import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { KeyboardShortcutsService } from './core/services/keyboard-shortcuts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';

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
  }

  logout(): void {
    this.authService.logout();
  }
}
