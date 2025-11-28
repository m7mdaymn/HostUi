import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';
import { UserQuickEditComponent } from '../shared/user-quick-edit.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, AdminTopbarComponent, UserQuickEditComponent, ConfirmDialogComponent],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  loading = false;
  users: any[] = [];
  error: string | null = null;
  quickEditVisible = false;
  editingUser: any | null = null;
  confirmVisible = false;
  confirmTarget: any | null = null;

  constructor(private usersService: UsersService, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.list().subscribe({
      next: (res: any) => {
        this.users = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
      },
      error: (err) => {
        console.error('Users load error', err);
        this.error = 'Unable to load users';
        this.loading = false;
      }
    });
  }

  edit(user: any) {
    this.router.navigateByUrl(`/admin/users/${user.id}/edit`);
  }

  openQuickEdit(user: any) {
    this.editingUser = user;
    this.quickEditVisible = true;
  }

  onQuickSaved(_res: any) {
    this.quickEditVisible = false;
    this.editingUser = null;
    this.toast.show('User saved', 'success');
    this.loadUsers();
  }

  addNew() {
    this.router.navigateByUrl('/admin/users/new');
  }

  toggleBlock(user: any) {
    const payload = { ...user, IsBlocked: !user.IsBlocked };
    this.usersService.update(user.id, payload).subscribe({
      next: () => this.loadUsers(),
      error: (err) => { console.error('Block toggle error', err); this.toast.show('Unable to toggle block', 'error'); }
    });
  }

  deleteUser(user: any) {
    this.confirmTarget = user;
    this.confirmVisible = true;
  }

  onConfirmDelete() {
    if (!this.confirmTarget) return;
    const id = this.confirmTarget.id || this.confirmTarget.Id;
    this.usersService.delete(id).subscribe({
      next: () => {
        this.toast.show('User deleted', 'success');
        this.confirmVisible = false;
        this.confirmTarget = null;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Delete user error', err);
        this.toast.show('Unable to delete user', 'error');
        this.confirmVisible = false;
        this.confirmTarget = null;
      }
    });
  }

  onCancelDelete() {
    this.confirmVisible = false;
    this.confirmTarget = null;
  }
}
