import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const { username, email, password } = this.form.value;
    this.authService.register(username, email, password).subscribe({
      next: () => {
        this.snackBar.open('Account created! Welcome 🎉', '', { duration: 3000 });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message ?? 'Registration failed', 'Close', { duration: 4000 });
      }
    });
  }
}
