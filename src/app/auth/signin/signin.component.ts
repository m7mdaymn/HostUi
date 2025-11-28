import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  form: any;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    console.log('🔍 Login error:', error);

    if (error.status === 0) {
      return 'Cannot connect to server. Please check your internet.';
    }

    const errorMsg = error.error;

    if (typeof errorMsg === 'string') {
      if (errorMsg.includes('Invalid email or password')) {
        return 'Invalid email or password.';
      }
      return errorMsg;
    }

    switch (error.status) {
      case 400: return 'Invalid credentials format.';
      case 401: return 'Invalid email or password.';
      case 403: return 'Account access forbidden.';
      case 500: return 'Server error. Please try again later.';
      default: return 'Sign in failed. Please try again.';
    }
  }

  private redirectByRole(user: User): void {
    console.log('🚀 Redirecting user:', user.name, 'Role:', user.role);

    if (user.role?.toLowerCase() === 'admin') {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.router.navigateByUrl('/home');
    }
  }

  submit() {
    this.error = null;
    this.success = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const creds = this.form.value as { email: string; password: string };
    console.log('🔐 Login attempt:', creds.email);

    this.auth.login(creds).subscribe({
      next: (response: any) => {
        this.loading = false;

        const user = this.auth.getCurrentUser();
        if (user) {
          this.success = `Welcome back, ${user.name}!`;

          setTimeout(() => {
            this.redirectByRole(user);
          }, 1500);
        } else {
          this.router.navigateByUrl('/home');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = this.getErrorMessage(err);
      }
    });
  }
}
