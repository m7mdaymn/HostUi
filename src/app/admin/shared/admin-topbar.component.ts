import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-topbar">
      <div class="brand">Admin</div>
      <div class="spacer"></div>
      <div class="user">{{userName}}</div>
      <button (click)="logout()">Logout</button>
    </div>
  `,
  styleUrls: ['./admin-topbar.component.css']
})
export class AdminTopbarComponent {
  userName = '';
  constructor(private auth: AuthService, private router: Router){ const u = this.auth.getCurrentUser(); this.userName = u?.name || u?.email || ''; }
  logout(){ this.auth.logout(); this.router.navigateByUrl('/signin'); }
}
