import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

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

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const creds = this.form.value as { email: string; password: string };
    this.auth.login({ email: creds.email, password: creds.password }).subscribe({
      next: (res) => {
        this.loading = false;
        // TODO: store token, redirect to dashboard
        // this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Sign in failed. Please check your credentials.';
      }
    });
  }
}
