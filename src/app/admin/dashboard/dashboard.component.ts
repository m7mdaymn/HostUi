import { AdminTopbarComponent } from './../shared/admin-topbar/admin-topbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { VpsService } from '../../core/services/vps.service';
import { DedicatedService } from '../../core/services/dedicated.service';
import { PackagesService } from '../../core/services/packages.service';
import { PromosService } from '../../core/services/promos.service';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { AdminSidebarComponent } from "../shared/admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  stats: any = null;
  error: string | null = null;
  recentUsers: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private usersService: UsersService,
    private vpsService: VpsService,
    private dedicatedService: DedicatedService,
    private packagesService: PackagesService,
    private promosService: PromosService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    this.http.get(API_ENDPOINTS.DASHBOARD.STATS).subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
        // attempt to populate recentUsers from stats if provided
        if (this.stats && Array.isArray(this.stats.recentUsers)) {
          this.recentUsers = this.stats.recentUsers.slice(0, 5);
        } else {
          this.loadRecentUsers();
        }

        // If some counts are missing, compute them by calling services
        this.ensureCounts();
      },
      error: (err) => {
        this.error = 'Unable to load dashboard stats';
        console.error('Dashboard stats error', err);
        this.loading = false;
        this.loadRecentUsers();
        this.ensureCounts();
      }
    });
  }

  private ensureCounts() {
    // ensure vps count
    if (!this.stats) this.stats = {};
    if (this.stats.totalVps === undefined || this.stats.totalVps === null) {
      this.vpsService.list().subscribe({ next: (r:any) => { const list = Array.isArray(r)? r : (r.data || r || []); this.stats.totalVps = list.length; }, error: e => { console.warn('Unable to fetch VPS list for stats', e); } });
    }
    if (this.stats.totalDedicated === undefined || this.stats.totalDedicated === null) {
      this.dedicatedService.list().subscribe({ next: (r:any) => { const list = Array.isArray(r)? r : (r.data || r || []); this.stats.totalDedicated = list.length; }, error: e => { console.warn('Unable to fetch Dedicated list for stats', e); } });
    }
    if (this.stats.totalPackages === undefined || this.stats.totalPackages === null) {
      this.packagesService.list().subscribe({ next: (r:any) => { const list = Array.isArray(r)? r : (r.data || r || []); this.stats.totalPackages = list.length; }, error: e => { console.warn('Unable to fetch Packages list for stats', e); } });
    }
    if (this.stats.totalPromos === undefined || this.stats.totalPromos === null) {
      this.promosService.list().subscribe({ next: (r:any) => { const list = Array.isArray(r)? r : (r.data || r || []); this.stats.totalPromos = list.length; }, error: e => { console.warn('Unable to fetch Promos list for stats', e); } });
    }
  }

  loadRecentUsers(): void {
    this.usersService.list().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res.data || res || []);
        // sort by CreatedAt if present (descending)
        const sorted = list.slice().sort((a: any, b: any) => {
          const ta = new Date(a.createdAt || a.CreatedAt || a.created || 0).getTime() || 0;
          const tb = new Date(b.createdAt || b.CreatedAt || b.created || 0).getTime() || 0;
          return tb - ta;
        });
        this.recentUsers = sorted.slice(0, 5);
      },
      error: (err) => {
        console.warn('Could not load recent users', err);
        this.recentUsers = [];
      }
    });
  }

  // UI handlers
  onRefresh(): void {
    this.loadStats();
  }

  onNew(): void {
    // quick action: go to add user page; admin can navigate to other create pages from there
    this.router.navigateByUrl('/admin/users/new');
  }

  goTo(section: string): void {
    switch ((section || '').toLowerCase()) {
      case 'users': this.router.navigateByUrl('/admin/users'); break;
      case 'vps': this.router.navigateByUrl('/admin/vps'); break;
      case 'dedicated': this.router.navigateByUrl('/admin/dedicated'); break;
      case 'packages': this.router.navigateByUrl('/admin/packages'); break;
      case 'promos': this.router.navigateByUrl('/admin/promos'); break;
      default: this.router.navigateByUrl('/admin/dashboard'); break;
    }
  }
}
