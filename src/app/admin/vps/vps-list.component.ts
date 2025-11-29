import { AdminTopbarComponent } from './../shared/admin-topbar/admin-topbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VpsService } from '../../core/services/vps.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-vps-list',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './vps-list.component.html',
  styleUrls: ['./vps-list.component.css']
})
export class VpsListComponent implements OnInit {
  loading = false;
  vps: any[] = [];
  error: string | null = null;

  constructor(private vpsService: VpsService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.vpsService.list().subscribe({
      next: (res: any) => {
        this.vps = Array.isArray(res) ? res : (res.data || res || []);
        this.loading = false;
      },
      error: (err) => { console.error(err); this.error = 'Unable to load VPS plans'; this.loading = false; }
    });
  }

  addNew() { this.router.navigateByUrl('/admin/vps/new'); }
  edit(item: any) { this.router.navigateByUrl(`/admin/vps/${item.id}/edit`); }
  delete(item: any) {
    if (!confirm('Delete VPS plan?')) return;
    this.vpsService.delete(item.id).subscribe({ next: () => this.load(), error: e => console.error(e) });
  }
}
