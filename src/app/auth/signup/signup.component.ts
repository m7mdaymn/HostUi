// signup.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
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
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+\d\s\-\(\)]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  passwordsMatch(): boolean {
    const pw = this.form.controls['password'].value;
    const cpw = this.form.controls['confirmPassword'].value;
    return pw && cpw && pw === cpw;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    console.log('🔍 FULL ERROR:', error);

    if (error.status === 0) {
      return 'Cannot connect to server. Please check your internet connection.';
    }

    if (typeof error.error === 'string') {
      if (error.error.includes('Email already exists')) {
        return 'This email is already registered. <a routerLink="/signin">Sign in instead?</a>';
      }
      return error.error;
    }

    return 'Something went wrong. Please try again.';
  }

  submit() {
    this.error = null;
    this.success = null;

    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      if (!this.passwordsMatch()) {
        this.error = 'Passwords do not match.';
      }
      return;
    }

    this.loading = true;

    const payload = {
      Name: this.form.value.name.trim(),
      Email: this.form.value.email.trim().toLowerCase(),
      PhoneNumber: this.form.value.phone.trim(),
      Password: this.form.value.password
    };

    console.log('📤 SENDING PAYLOAD:', payload);

    this.auth.register(payload).subscribe({
      next: (res: any) => {
        console.log('✅ REGISTER SUCCESS:', res);
        this.loading = false;
        this.success = 'Account created successfully! Redirecting to sign in...';

        setTimeout(() => {
          this.router.navigateByUrl('/signin');
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        console.log('❌ REGISTER ERROR:', err);
        this.loading = false;
        this.error = this.getErrorMessage(err);
      }
    });
  }
}
