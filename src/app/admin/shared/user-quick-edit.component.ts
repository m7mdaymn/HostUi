import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-user-quick-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="qe-backdrop">
      <div class="qe-modal">
        <h3>Quick edit user</h3>
        <form [formGroup]="form" (ngSubmit)="save()">
          <label>Role</label>
          <select formControlName="role" class="form-control">
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
            <option value="User">User</option>
          </select>

          <label>Blocked</label>
          <select formControlName="isBlocked" class="form-control">
            <option [ngValue]="false">No</option>
            <option [ngValue]="true">Yes</option>
          </select>

          <div class="actions">
            <button type="submit" class="btn primary">Save</button>
            <button type="button" class="btn" (click)="onCancel()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .qe-backdrop{position:fixed;inset:0;background:rgba(2,6,23,0.6);display:flex;align-items:center;justify-content:center;z-index:1200}
    .qe-modal{width:380px;background:var(--admin-card-bg);padding:18px;border-radius:8px;border:1px solid var(--admin-border);box-shadow:var(--admin-elev);color:var(--admin-text)}
    .qe-modal h3{margin:0 0 12px 0}
    .form-control{width:100%;padding:8px;margin-top:6px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:var(--admin-text)}
    label{display:block;color:var(--admin-muted);margin-top:10px}
    .actions{display:flex;gap:8px;margin-top:14px}
    .btn{padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:var(--admin-text)}
    .btn.primary{background:linear-gradient(90deg,var(--admin-accent),var(--admin-accent-strong));color:#042234;border:none}
  `]
})
export class UserQuickEditComponent {
  @Input() user: any | null = null;
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private users: UsersService, private toast: ToastService) {
    this.form = this.fb.group({ role: ['Customer'], isBlocked: [false] });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      const role = this.user.role || this.user.Role || 'Customer';
      const blocked = !!(this.user.isBlocked || this.user.IsBlocked);
      this.form.patchValue({ role, isBlocked: blocked });
    }
  }

  save() {
    if (!this.user) return;
    const payload = { ...this.user, role: this.form.value.role, isBlocked: this.form.value.isBlocked };
    this.users.update(this.user.id || this.user.Id, payload).subscribe({
      next: (res) => {
        this.toast.show('User updated', 'success');
        this.saved.emit(res);
      },
      error: (err) => {
        console.error('Quick edit save error', err);
        this.toast.show('Unable to update user', 'error');
      }
    });
  }

  onCancel() { this.cancel.emit(); }
}
