import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';

@Component({
  selector: 'app-admin-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  form: any;
  loading = false;
  error: string | null = null;
  isNew = true;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['customer', Validators.required],
      isBlocked: [false]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId && this.userId !== 'new') {
      this.isNew = false;
      this.loadUser(this.userId);
    }
  }

  loadUser(id: string) {
    this.loading = true;
    this.usersService.get(id).subscribe({
      next: (res: any) => {
        const u = res || res.data || {};
        this.form.patchValue({
          name: u.name || u.Name || '',
          email: u.email || u.Email || '',
          phone: u.phoneNumber || u.PhoneNumber || u.phone || '',
          role: (u.role || u.Role || 'customer').toLowerCase(),
          isBlocked: !!(u.isBlocked || u.IsBlocked)
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Load user error', err);
        this.error = 'Unable to load user';
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      Name: this.form.value.name,
      Email: this.form.value.email,
      PhoneNumber: this.form.value.phone,
      Role: this.form.value.role,
      IsBlocked: this.form.value.isBlocked
    };

    this.loading = true;

    if (this.isNew) {
      // password not required here; admin can set default password or API may accept without it
      this.usersService.create({ ...payload, Password: 'ChangeMe123!' }).subscribe({
        next: () => { this.loading = false; this.toast.show('User created', 'success'); this.router.navigateByUrl('/admin/users'); },
        error: (err) => { console.error(err); this.error = 'Create failed'; this.toast.show('Create failed', 'error'); this.loading = false; }
      });
    } else {
      this.usersService.update(this.userId!, payload).subscribe({
        next: () => { this.loading = false; this.toast.show('User updated', 'success'); this.router.navigateByUrl('/admin/users'); },
        error: (err) => { console.error(err); this.error = 'Update failed'; this.toast.show('Update failed', 'error'); this.loading = false; }
      });
    }
  }

  toggleBlockNow() {
    // flip current form value and send update immediately
    const current = !!this.form.value.isBlocked;
    const newVal = !current;
    const payload = { IsBlocked: newVal } as any;
    this.loading = true;
    this.usersService.update(this.userId!, payload).subscribe({
      next: () => {
        this.loading = false;
        this.form.patchValue({ isBlocked: newVal });
        this.toast.show(newVal ? 'User blocked' : 'User unblocked', 'success');
      },
      error: (err) => {
        console.error('Toggle block failed', err);
        this.loading = false;
        this.toast.show('Unable to change block state', 'error');
      }
    });
  }

  cancel() {
    this.router.navigateByUrl('/admin/users');
  }
}
