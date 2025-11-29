// src/app/admin/users/users-list.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';

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
  users: any[] = [];
  error: string | null = null;

  modalOpen = false;
  quickModalOpen = false;
  deleteConfirmOpen = false;
  selectedUser: any = null;
  deleteTarget: any = null;
  saving = false;

  quickUser: any = {};
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['customer', Validators.required],
      isBlocked: [false]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.users = [];

    this.usersService.list().subscribe({
      next: (response: any) => {
        let list: any[] = [];

        const extractArray = (data: any): any[] => {
          if (Array.isArray(data)) return data;
          if (data && typeof data === 'object') {
            if (data.data && Array.isArray(data.data)) return data.data;
            if (data.users && Array.isArray(data.users)) return data.users;
            if (data.result && Array.isArray(data.result)) return data.result;
            const found = Object.values(data).find(Array.isArray);
            return found || [];
          }
          return [];
        };

        if (Array.isArray(response)) {
          list = response;
        } else if (response && typeof response === 'object') {
          list = 'data' in response ? extractArray(response.data) : extractArray(response);
        }

        this.users = list.map((u: any) => ({
          id: u.id ?? u.Id ?? u._id ?? '',
          name: u.name ?? u.Name ?? u.fullName ?? u.username ?? 'Unknown',
          email: u.email ?? u.Email ?? '',
          phoneNumber: u.phone ?? u.phoneNumber ?? u.PhoneNumber ?? u.mobile ?? '',
          role: String(u.role ?? u.Role ?? 'customer').toLowerCase(),
          isBlocked: !!u.isBlocked || !!u.IsBlocked || u.status === 'blocked',
          createdAt: u.createdAt ?? u.CreatedAt ?? u.date ?? new Date().toISOString(),
        }));

        if (this.users.length === 0) {
          this.error = 'No users found.';
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Load users failed:', err);
        this.error = err?.error?.message || 'Failed to load users';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openUserModal(user?: any) {
    this.selectedUser = user || null;

    if (user) {
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || '',
        role: user.role,
        isBlocked: user.isBlocked
      });
    } else {
      this.userForm.reset({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        isBlocked: false
      });
    }
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedUser = null;
  }

  saveUser() {
    if (this.userForm.invalid || this.saving) return;

    this.saving = true;
    const v = this.userForm.value;

    // PascalCase payload for backend
    const payload: any = {
      Name: v.name?.trim(),
      Email: v.email?.trim(),
      Role: v.role,
      IsBlocked: v.isBlocked === true
    };

    if (v.phone?.trim()) {
      payload.PhoneNumber = v.phone.trim();
    }

    if (!this.selectedUser) {
      payload.Password = 'Welcome123!';
    }

    console.log('Sending payload →', payload);

    const request = this.selectedUser
      ? this.usersService.update(this.selectedUser.id, payload)
      : this.usersService.create(payload);

    request.subscribe({
      next: () => {
        this.toast.show(
          this.selectedUser ? 'User updated successfully' : 'User created successfully',
          'success'
        );
        this.closeModal();
        this.loadUsers();
        this.saving = false;
      },
      error: (err) => {
        console.error('Save failed:', err);
        const msg =
          err?.error?.errors
            ? Object.values(err.error.errors).flat().join(', ')
            : err?.error?.message || err?.error?.title || 'Failed to save user';
        this.toast.show(msg, 'error');
        this.saving = false;
      }
    });
  }

  openQuickEdit(user: any) {
    this.quickUser = { ...user };
    this.quickModalOpen = true;
  }

  saveQuick() {
    if (this.saving) return;
    this.saving = true;

    // FIXED: Include all required fields
    const payload = {
      Name: this.quickUser.name,
      Email: this.quickUser.email,
      Role: this.quickUser.role,
      IsBlocked: this.quickUser.isBlocked,
      PhoneNumber: this.quickUser.phoneNumber || null
    };

    console.log('Quick Edit Payload:', payload);

    this.usersService.update(this.quickUser.id, payload).subscribe({
      next: () => {
        this.toast.show('User updated successfully', 'success');
        this.quickModalOpen = false;
        this.loadUsers();
        this.saving = false;
      },
      error: (err) => {
        console.error('Quick edit failed:', err);
        const msg = err?.error?.errors
          ? Object.values(err.error.errors).flat().join(', ')
          : err?.error?.message || 'Update failed';
        this.toast.show(msg, 'error');
        this.saving = false;
      }
    });
  }

  toggleBlock(user: any) {
    // FIXED: Include all required fields
    const payload = {
      Name: user.name,
      Email: user.email,
      Role: user.role,
      IsBlocked: !user.isBlocked,
      PhoneNumber: user.phoneNumber || null
    };

    console.log('Toggle Block Payload:', payload);

    this.usersService.update(user.id, payload).subscribe({
      next: () => {
        this.toast.show(
          user.isBlocked ? 'User unblocked successfully' : 'User blocked successfully',
          'success'
        );
        this.loadUsers();
      },
      error: (err) => {
        console.error('Toggle block failed:', err);
        const msg = err?.error?.message || 'Action failed';
        this.toast.show(msg, 'error');
      }
    });
  }

  confirmDelete(user: any) {
    this.deleteTarget = user;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed() {
    if (!this.deleteTarget) return;

    this.usersService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.show('User deleted successfully', 'success');
        this.deleteConfirmOpen = false;
        this.deleteTarget = null;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.toast.show(err?.error?.message || 'Delete failed', 'error');
      }
    });
  }

  closeAllModals() {
    this.modalOpen = false;
    this.quickModalOpen = false;
    this.deleteConfirmOpen = false;
    this.selectedUser = null;
    this.deleteTarget = null;
  }

  getInitial(u: any): string {
    return (u.name || u.email || '?').charAt(0).toUpperCase();
  }

  formatDate(date: any): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByUserId(index: number, user: any): any {
    return user.id;
  }
}
