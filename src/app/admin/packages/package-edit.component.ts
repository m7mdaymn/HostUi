import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PackagesService } from '../../core/services/packages.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';

@Component({
  selector: 'app-admin-package-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './package-edit.component.html',
  styleUrls: ['./package-edit.component.css']
})
export class PackageEditComponent implements OnInit {
  form: any;
  id: string | null = null;
  isNew = true;

  constructor(private fb: FormBuilder, private svc: PackagesService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({ name: ['', Validators.required], totalPrice: [0], durationMonths: [1, Validators.required] });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id && this.id !== 'new') { this.isNew = false; this.load(this.id); }
  }

  load(id: string) { this.svc.get(id).subscribe({ next: (res:any) => { const p = res || res.data || {}; this.form.patchValue({ name: p.name||p.Name, totalPrice: p.totalPrice||p.TotalPrice, durationMonths: p.durationMonths||p.DurationMonths }); }, error: e => console.error(e) }); }

  save() { if (this.form.invalid) return; const payload = { Name: this.form.value.name, TotalPrice: this.form.value.totalPrice, DurationMonths: this.form.value.durationMonths }; if (this.isNew) { this.svc.create(payload).subscribe({ next: () => this.router.navigateByUrl('/admin/packages'), error: e => console.error(e) }); } else { this.svc.update(this.id!, payload).subscribe({ next: () => this.router.navigateByUrl('/admin/packages'), error: e => console.error(e) }); } }

  cancel() { this.router.navigateByUrl('/admin/packages'); }
}
