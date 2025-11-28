import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap">
      <div *ngFor="let m of msgs" class="toast" [ngClass]="m.type">
        {{m.text}}
        <button class="close" (click)="remove(m.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-wrap{position:fixed;right:12px;top:12px;z-index:9999;display:flex;flex-direction:column;gap:8px}
    .toast{background:#222;color:#fff;padding:10px 14px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.12);min-width:180px;position:relative}
    .toast.success{background:linear-gradient(90deg,#2ecc71,#27ae60)}
    .toast.error{background:linear-gradient(90deg,#e74c3c,#c0392b)}
    .toast.info{background:linear-gradient(90deg,#3498db,#2980b9)}
    .toast .close{position:absolute;right:6px;top:6px;background:transparent;border:0;color:rgba(255,255,255,.9);font-size:14px}
  `]
})
export class ToastComponent {
  msgs: ToastMessage[] = [];
  constructor(private svc: ToastService) { this.svc.messages$.subscribe(m => this.msgs = m); }
  remove(id: number) { this.svc.remove(id); }
}
