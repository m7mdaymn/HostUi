// src/app/admin/users/users-list.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsersService, User } from '../../core/services/users.service';
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
  users: User[] = [];
  error: string | null = null;

  modalOpen = false;
  deleteConfirmOpen = false;
  selectedUser: User | null = null;
  deleteTarget: User | null = null;
  saving = false;

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
        if (this.users.length === 0) this.error = 'No users found.';
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

    if (user) {
      this.userForm.patchValue({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        isAdmin: this.isAdmin(user),
        isBlocked: !!user.isBlocked
      });
    } else {
      this.userForm.reset({
        name: '', email: '', phone: '', isAdmin: false, isBlocked: false
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
    const payload: any = {
      Name: v.name.trim(),
      Email: v.email.trim(),
      Role: v.isAdmin ? 1 : 0,
      IsBlocked: v.isBlocked,
      PhoneNumber: v.phone?.trim() || null
    };

    if (!this.selectedUser) {
      payload.Password = 'Welcome123!';
    }

    const request = this.selectedUser
      ? this.usersService.update(this.selectedUser.id!, payload)
      : this.usersService.create(payload);

    request.subscribe({
      next: () => {
        this.toast.show(this.selectedUser ? 'User updated!' : 'User created!', 'success');
        this.closeModal();
        this.loadUsers();
        this.saving = false;
      },
      error: (err) => {
        this.toast.show(err.message || 'Save failed', 'error');
        this.saving = false;
      }
    });
  }

  toggleBlock(user: User) {
    const payload: any = {
      Name: user.name,
      Email: user.email,
      PhoneNumber: user.phoneNumber || null,
      Role: this.isAdmin(user) ? 1 : 0,
      IsBlocked: !user.isBlocked
    };

    this.usersService.update(user.id!, payload).subscribe({
      next: () => {
        this.toast.show(user.isBlocked ? 'User unblocked' : 'User blocked', 'success');
        this.loadUsers();
      },
      error: (err) => this.toast.show(err.message || 'Failed', 'error')
    });
  }

  confirmDelete(user: User) {
    this.deleteTarget = user;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed() {
    if (!this.deleteTarget) return;

    this.usersService.delete(this.deleteTarget.id!).subscribe({
      next: () => {
        this.toast.show('User deleted', 'success');
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
