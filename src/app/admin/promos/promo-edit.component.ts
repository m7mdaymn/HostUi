import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PromosService } from '../../core/services/promos.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar.component';

@Component({
  selector: 'app-admin-promo-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './promo-edit.component.html',
  styleUrls: ['./promo-edit.component.css']
})
export class PromoEditComponent implements OnInit {
  form: any;
  loading=false; id: any=null; error:string| null = null;
  constructor(private fb: FormBuilder, private svc: PromosService, private route: ActivatedRoute, private router: Router, private toast: ToastService) {
    this.form = this.fb.group({ title: [''], description: [''], isActive: [true], promoType: [''] });
  }
  ngOnInit(): void { this.id = this.route.snapshot.params['id']; if(this.id && this.id!=='new') this.load(); }
  load(){ this.loading=true; this.svc.get(this.id).subscribe({ next: (r:any) => { const d = (r && r.data) ? r.data : r; this.form.patchValue({ title: d.title || d.Name || d.Title, description: d.description || d.Description, isActive: d.isActive || d.IsActive, promoType: d.promoType || d.PromoType }); this.loading=false; }, error: e => { console.error(e); this.error='Unable to load promo'; this.loading=false; } }); }
  save(){ const payload = { title: this.form.value.title, description: this.form.value.description, isActive: this.form.value.isActive, promoType: this.form.value.promoType };
    if(this.id && this.id!=='new') {
      this.svc.update(this.id, payload).subscribe({ next: () => { this.toast.show('Promo saved', 'success'); this.router.navigateByUrl('/admin/promos'); }, error: e => { console.error(e); this.toast.show('Unable to save promo', 'error'); } });
    } else {
      this.svc.create(payload).subscribe({ next: () => { this.toast.show('Promo created', 'success'); this.router.navigateByUrl('/admin/promos'); }, error: e => { console.error(e); this.toast.show('Unable to create promo', 'error'); } });
    }
  }
  cancel(){ this.router.navigateByUrl('/admin/promos'); }
}
