import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

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

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  passwordsMatch(): boolean {
    const pw = this.form.controls['password'].value;
    const cpw = this.form.controls['confirmPassword'].value;
    return pw && cpw && pw === cpw;
  }

  submit() {
    this.error = null;
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      if (!this.passwordsMatch()) this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    const payload = {
      name: this.form.value.name,
      email: this.form.value.email,
      phone: this.form.value.phone,
      password: this.form.value.password
    };
    // Call backend register endpoint (AuthService.register)
    this.auth.register({ name: payload.name, email: payload.email, password: payload.password, phone: payload.phone, address: '', age: 0 }).subscribe({
      next: (res) => {
        this.loading = false;
        // TODO: show success / redirect to sign-in
        this.router.navigateByUrl('/signin');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Sign up failed. Try again.';
      }
    });
  }
}
