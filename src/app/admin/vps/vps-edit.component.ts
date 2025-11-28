import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VpsService } from '../../core/services/vps.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';

@Component({
  selector: 'app-admin-vps-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './vps-edit.component.html',
  styleUrls: ['./vps-edit.component.css']
})
export class VpsEditComponent implements OnInit {
  form: any;
  loading = false;
  isNew = true;
  id: string | null = null;

  constructor(private fb: FormBuilder, private vpsService: VpsService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({
      region: ['', Validators.required],
      cores: [4, Validators.required],
      ramGB: [8, Validators.required],
      storageGB: [75, Validators.required],
      storageType: ['SSD', Validators.required],
      connectionSpeed: ['1Gbps'],
      price: [0, Validators.required],
      category: ['LowSpace']
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id && this.id !== 'new') {
      this.isNew = false;
      this.load(this.id);
    }
  }

  load(id: string) {
    this.loading = true;
    this.vpsService.get(id).subscribe({ next: (res:any) => { const p = res || res.data || {}; this.form.patchValue({ region:p.region||p.Region, cores:p.cores||p.Cores, ramGB:p.ramGB||p.RamGB, storageGB:p.storageGB||p.StorageGB, storageType:p.storageType||p.StorageType, connectionSpeed:p.connectionSpeed||p.ConnectionSpeed, price:p.price||p.Price, category:p.category||p.Category }); this.loading=false; }, error: e => { console.error(e); this.loading=false; } });
  }

  save() {
    if (this.form.invalid) return;
    const payload = { Region: this.form.value.region, Cores: this.form.value.cores, RamGB: this.form.value.ramGB, StorageGB: this.form.value.storageGB, StorageType: this.form.value.storageType, ConnectionSpeed: this.form.value.connectionSpeed, Price: this.form.value.price, Category: this.form.value.category };
    this.loading = true;
    if (this.isNew) {
      this.vpsService.create(payload).subscribe({ next: () => { this.loading=false; this.router.navigateByUrl('/admin/vps'); }, error: e => { console.error(e); this.loading=false; } });
    } else {
      this.vpsService.update(this.id!, payload).subscribe({ next: () => { this.loading=false; this.router.navigateByUrl('/admin/vps'); }, error: e => { console.error(e); this.loading=false; } });
    }
  }

  cancel() { this.router.navigateByUrl('/admin/vps'); }
}
