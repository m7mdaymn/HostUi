import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PackagesService } from '../../core/services/packages.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';

@Component({
  selector: 'app-admin-packages-list',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './packages-list.component.html',
  styleUrls: ['./packages-list.component.css']
})
export class PackagesListComponent implements OnInit {
  loading = false;
  items: any[] = [];
  error: string | null = null;

  constructor(private svc: PackagesService, private router: Router) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.svc.list().subscribe({ next: (res:any) => { this.items = Array.isArray(res) ? res : (res.data || res || []); this.loading=false; }, error: e => { console.error(e); this.error='Unable to load packages'; this.loading=false; } }); }
  addNew() { this.router.navigateByUrl('/admin/packages/new'); }
  edit(i:any) { this.router.navigateByUrl(`/admin/packages/${i.id}/edit`); }
  delete(i:any) { if(!confirm('Delete package?')) return; this.svc.delete(i.id).subscribe({ next: () => this.load(), error: e => console.error(e) }); }
}
