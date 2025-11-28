import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cd-backdrop">
      <div class="cd-modal">
        <div class="cd-body">
          <h3>{{title || 'Confirm'}}</h3>
          <p>{{message || 'Are you sure?'}}</p>
        </div>
        <div class="cd-actions">
          <button class="btn" (click)="cancel.emit()">Cancel</button>
          <button class="btn danger" (click)="confirm.emit()">Confirm</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cd-backdrop{position:fixed;inset:0;background:rgba(2,6,23,0.6);display:flex;align-items:center;justify-content:center;z-index:1200}
    .cd-modal{width:360px;background:var(--admin-card-bg);padding:16px;border-radius:8px;border:1px solid var(--admin-border);box-shadow:var(--admin-elev);color:var(--admin-text)}
    .cd-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
    .cd-body p{color:var(--admin-muted)}
    .btn{padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:var(--admin-text)}
    .btn.danger{background:var(--admin-danger);border:none;color:#fff}
  `]
})
export class ConfirmDialogComponent {
  @Input() title?: string;
  @Input() message?: string;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
