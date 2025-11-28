import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PackageItemsService } from '../../core/services/packageitems.service';
import { PackagesService } from '../../core/services/packages.service';
import { VpsService } from '../../core/services/vps.service';
import { DedicatedService } from '../../core/services/dedicated.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { ToastService } from '../../core/services/toast.service';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';

@Component({
  selector: 'app-admin-package-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './package-items.component.html',
  styleUrls: ['./package-items.component.css']
})
export class PackageItemsComponent implements OnInit {
  items: any[] = [];
  packages: any[] = [];
  vps: any[] = [];
  dedicated: any[] = [];
  loading = false;
  error: string | null = null;
  form = this.fb.group({ packageId: [''], productType: ['vps'], productId: [''], quantity: [1], note: [''] });

  constructor(private fb: FormBuilder, private pis: PackageItemsService, private ps: PackagesService, private vs: VpsService, private ds: DedicatedService, private toast: ToastService) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.pis.list().subscribe({ next: (r:any) => { this.items = Array.isArray(r) ? r : (r.data || r || []); this.loading=false; }, error: e => { console.error(e); this.loading=false; } });
    this.ps.list().subscribe({ next: (r:any) => this.packages = Array.isArray(r) ? r : (r.data || r || []) });
    this.vs.list().subscribe({ next: (r:any) => this.vps = Array.isArray(r) ? r : (r.data || r || []) });
    this.ds.list().subscribe({ next: (r:any) => this.dedicated = Array.isArray(r) ? r : (r.data || r || []) });
  }
  onProductTypeChange() {
    // reset selected product when product type changes
    this.form.patchValue({ productId: '' });
  }

  onAdd() {
    const v = this.form.value;
    if(!v.packageId) { alert('Select package'); return; }
    const payload: any = { PackageId: v.packageId, ProductType: v.productType, Quantity: v.quantity || 1, Note: v.note || '' };
    if(v.productType === 'vps') payload.VpsId = v.productId; else payload.DedicatedId = v.productId;
    this.pis.create(payload).subscribe({ next: () => { this.form.patchValue({ productId: '', quantity: 1, note: '' }); this.toast.show('Package item added', 'success'); this.loadAll(); }, error: e => { console.error(e); this.toast.show('Unable to add package item', 'error'); } });
  }
  addItem(payload: any) { this.pis.create(payload).subscribe({ next: () => this.loadAll(), error: e => console.error(e) }); }
  updateItem(id:any, payload:any) { this.pis.update(id, payload).subscribe({ next: () => { this.toast.show('Package item updated', 'success'); this.loadAll(); }, error: e => { console.error(e); this.toast.show('Unable to update package item', 'error'); } }); }
  deleteItem(id:any) { if(!confirm('Remove item?')) return; this.pis.delete(id).subscribe({ next: () => { this.toast.show('Package item removed', 'success'); this.loadAll(); }, error: e => { console.error(e); this.toast.show('Unable to remove package item', 'error'); } }); }
}
