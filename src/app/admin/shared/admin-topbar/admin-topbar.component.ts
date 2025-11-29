import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.css']
})
export class AdminTopbarComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  userName = '';
  userEmail = '';
  userInitial = '?';
  dropdownOpen = false;
  currentPageTitle = 'Dashboard';

  ngOnInit() {
    this.loadUser();
    this.updatePageTitle();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updatePageTitle());
  }

  loadUser() {
    const user = this.auth.getCurrentUser();
    this.userName = user?.name || user?.email?.split('@')[0] || 'Admin';
    this.userEmail = user?.email || 'admin@topservers.com';
    this.userInitial = (this.userName[0] || '?').toUpperCase();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const sidebar = document.querySelector('.admin-sidebar') as HTMLElement;
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }

  updatePageTitle() {
    const url = this.router.url;
    const map: Record<string, string> = {
      'dashboard': 'Dashboard',
      'users': 'Users',
      'vps': 'VPS Plans',
      'dedicated': 'Dedicated Servers',
      'packages': 'Packages',
      'promos': 'Promos',
      'profile': 'Profile',
      'settings': 'Settings'
    };
    const segment = url.split('/').pop() || 'dashboard';
    this.currentPageTitle = map[segment] || 'Admin';
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/signin');
  }
}
