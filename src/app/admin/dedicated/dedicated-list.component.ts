import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DedicatedService } from '../../core/services/dedicated.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';

@Component({
  selector: 'app-admin-dedicated-list',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './dedicated-list.component.html'
})
export class DedicatedListComponent implements OnInit {
  loading = false;
  items: any[] = [];
  error: string | null = null;

  constructor(private ds: DedicatedService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.ds.list().subscribe({ next: (res:any) => { this.items = Array.isArray(res) ? res : (res.data || res || []); this.loading=false; }, error: e => { console.error(e); this.error='Unable to load'; this.loading=false; } });
  }

  addNew() { this.router.navigateByUrl('/admin/dedicated/new'); }
  edit(i: any) { this.router.navigateByUrl(`/admin/dedicated/${i.id}/edit`); }
  delete(i: any) { if (!confirm('Delete server?')) return; this.ds.delete(i.id).subscribe({ next: () => this.load(), error: e => console.error(e) }); }
}
