import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PromosService } from '../../core/services/promos.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';

@Component({
  selector: 'app-admin-promos-list',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './promos-list.component.html',
  styleUrls: ['./promos-list.component.css']
})
export class PromosListComponent implements OnInit {
  loading = false; items: any[] = []; error: string | null = null;
  constructor(private svc: PromosService, private router: Router, private toast: ToastService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.svc.list().subscribe({ next: (r:any) => { this.items = Array.isArray(r) ? r : (r.data || r || []); this.loading=false; }, error: e => { console.error(e); this.error='Unable to load promos'; this.loading=false; } }); }
  addNew() { this.router.navigateByUrl('/admin/promos/new'); }
  edit(i:any) { this.router.navigateByUrl(`/admin/promos/${i.id}/edit`); }
  toggleActive(i:any) {
    const payload = { ...i, IsActive: !(i.isActive||i.IsActive) };
    this.svc.update(i.id, payload).subscribe({ next: () => { this.toast.show('Promo updated', 'success'); this.load(); }, error: e => { console.error(e); this.toast.show('Unable to update promo', 'error'); } });
  }
  delete(i:any) {
    if(!confirm('Delete promo?')) return;
    this.svc.delete(i.id).subscribe({ next: () => { this.toast.show('Promo deleted', 'success'); this.load(); }, error: e => { console.error(e); this.toast.show('Unable to delete promo', 'error'); } });
  }
}
