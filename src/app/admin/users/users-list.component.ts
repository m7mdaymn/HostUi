// src/app/admin/users/users-list.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { UsersService, User } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';

// Validator: password === confirmPassword
function confirmPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const form = control.parent;
    if (!form) return null;
    const password = form.get('password')?.value;
    const confirm = control.value;
    return password === confirm ? null : { mismatch: true };
  };
}

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminSidebarComponent,
    AdminTopbarComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  loading = true;
  users: User[] = [];
  error: string | null = null;

  modalOpen = false;
  deleteConfirmOpen = false;
  selectedUser: User | null = null;
  deleteTarget: User | null = null;
  saving = false;
  showPassword = false;

  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.createForm();
  }

  private createForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, confirmPasswordValidator()]],
      phone: [''],
      isAdmin: [false],
      isBlocked: [false]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.usersService.list().subscribe({
      next: (users: User[]) => {
        this.users = users.map(u => ({
          ...u,
          role: this.normalizeRole(u.role).toString()
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load users';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private normalizeRole(role: any): number {
    return role === 1 || role === '1' || role === 'admin' || role === 'Admin' ? 1 : 0;
  }

  isAdmin(user: User): boolean {
    return this.normalizeRole(user.role) === 1;
  }

  openUserModal(user?: User) {
    this.selectedUser = user ? { ...user } : null;
    this.showPassword = false;

    if (user) {
      // EDIT MODE
      this.userForm.patchValue({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        isAdmin: this.isAdmin(user),
        isBlocked: !!user.isBlocked
      });

      // Disable password fields
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
      this.userForm.get('password')?.setValue('');
      this.userForm.get('confirmPassword')?.setValue('');

    } else {
      // CREATE MODE
      this.userForm.reset({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        isAdmin: false,
        isBlocked: false
      });

      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('confirmPassword')?.setValidators([Validators.required, confirmPasswordValidator()]);
    }

    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedUser = null;
    this.showPassword = false;
  }

  saveUser() {
    if (this.userForm.invalid || this.saving) return;

    // Mark all as touched to show validation
    this.userForm.markAllAsTouched();

    const v = this.userForm.value;

    // Extra check for password match
    if (v.password !== v.confirmPassword) {
      this.toast.show('Passwords do not match!', 'error');
      return;
    }

    this.saving = true;

    if (!this.selectedUser) {
      // CREATE USER – 100% MATCHING YOUR WORKING SIGNUP COMPONENT
      const payload = {
        Name: v.name.trim(),
        Email: v.email.trim().toLowerCase(),
        PhoneNumber: v.phone?.trim() || null,
        Password: v.password
      };

      console.log('Sending register payload:', payload); // For debugging

      this.authService.register(payload).subscribe({
        next: (res: any) => {
          console.log('User created successfully:', res);
          this.toast.show('User created successfully!', 'success');
          this.closeModal();
          this.loadUsers();
          this.saving = false;
        },
        error: (err: any) => {
          const msg = err?.error?.message || err?.message || 'Failed to create user. Email may already exist.';
          this.toast.show(msg, 'error');
          this.saving = false;
        }
      });

    } else {
      // EDIT USER
      const payload: any = {
        Name: v.name.trim(),
        Email: v.email.trim(),
        Role: v.isAdmin ? 1 : 0,
        IsBlocked: v.isBlocked,
        PhoneNumber: v.phone?.trim() || null
      };

      this.usersService.update(this.selectedUser.id!, payload).subscribe({
        next: () => {
          this.toast.show('User updated successfully!', 'success');
          this.closeModal();
          this.loadUsers();
          this.saving = false;
        },
        error: (err) => {
          this.toast.show(err.message || 'Update failed', 'error');
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(user: User) {
    this.deleteTarget = user;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed() {
    if (!this.deleteTarget) return;

    this.usersService.delete(this.deleteTarget.id!).subscribe({
      next: () => {
        this.toast.show('User deleted permanently', 'success');
        this.deleteConfirmOpen = false;
        this.deleteTarget = null;
        this.loadUsers();
      },
      error: (err) => this.toast.show(err.message || 'Delete failed', 'error')
    });
  }

  closeAllModals() {
    this.modalOpen = this.deleteConfirmOpen = false;
    this.selectedUser = this.deleteTarget = null;
    this.showPassword = false;
  }

  getInitial(u: User): string {
    return (u.name || u.email || '?').charAt(0).toUpperCase();
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByUserId(_: number, user: User): any {
    return user.id;
  }
}
