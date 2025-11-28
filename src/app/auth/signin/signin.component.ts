import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService, User, AuthResponse } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  form: any;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to current path
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    console.log('🔍 Login error:', error);

    if (error.status === 0) {
      return 'Cannot connect to server. Please check your internet.';
    }

    // Handle structured error response from auth service
    if (error.error?.message) {
      return error.error.message;
    }

    const errorMsg = error.error;

    if (typeof errorMsg === 'string') {
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

    switch (user.role) {
      case 'admin':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      case 'moderator':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      default:
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
      next: (response: AuthResponse) => {
        this.loading = false;

        // User is automatically stored by auth service
        const user = this.auth.getCurrentUser();
        if (user) {
          this.success = response.message || `Welcome back, ${user.name}!`;

          setTimeout(() => {
            // Prefer returnUrl if provided (from auth guard)
            if (this.returnUrl) {
              this.router.navigateByUrl(this.returnUrl);
            } else {
              this.redirectByRole(user);
            }
          }, 1500);
        } else {
          console.warn('⚠️ User not found after successful login');
          this.router.navigateByUrl('/home');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = this.getErrorMessage(err);
        console.error('❌ Login failed:', err);
      }
    });
  }
}
