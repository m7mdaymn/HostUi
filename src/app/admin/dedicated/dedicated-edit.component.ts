import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DedicatedService } from '../../core/services/dedicated.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';

@Component({
  selector: 'app-admin-dedicated-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminTopbarComponent,AdminSidebarComponent],
  templateUrl: './dedicated-edit.component.html',
  styleUrls: ['./dedicated-edit.component.css']
})
export class DedicatedEditComponent implements OnInit {
  form: any;
  id: string | null = null;
  isNew = true;

  constructor(private fb: FormBuilder, private ds: DedicatedService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({ cpuModel: ['', Validators.required], cores: [4], ramGB: [8], storage: [''], connectionSpeed: ['2.5Gbps'], price: [0], brand: [''] });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id && this.id !== 'new') { this.isNew = false; this.load(this.id); }
  }

  load(id: string) { this.ds.get(id).subscribe({ next: (res:any) => { const s = res || res.data || {}; this.form.patchValue({ cpuModel: s.cpuModel||s.CpuModel, cores: s.cores||s.Cores, ramGB: s.ramGB||s.RamGB, storage: s.storage||s.Storage, connectionSpeed: s.connectionSpeed||s.ConnectionSpeed, price: s.price||s.Price, brand: s.brand||s.Brand }); }, error: e => console.error(e) }); }

  save() { if (this.form.invalid) return; const payload = { CpuModel: this.form.value.cpuModel, Cores: this.form.value.cores, RamGB: this.form.value.ramGB, Storage: this.form.value.storage, ConnectionSpeed: this.form.value.connectionSpeed, Price: this.form.value.price, Brand: this.form.value.brand }; if (this.isNew) { this.ds.create(payload).subscribe({ next: () => this.router.navigateByUrl('/admin/dedicated'), error: e => console.error(e) }); } else { this.ds.update(this.id!, payload).subscribe({ next: () => this.router.navigateByUrl('/admin/dedicated'), error: e => console.error(e) }); } }

  cancel() { this.router.navigateByUrl('/admin/dedicated'); }
}
