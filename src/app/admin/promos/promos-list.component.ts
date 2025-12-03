import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PromosService } from '../../core/services/promos.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';

@Component({
  selector: 'app-admin-promos-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './promos-list.component.html',
  styleUrls: ['../vps/vps-list.component.css']
})
export class PromosListComponent implements OnInit {
  loading = true;
  promos: any[] = [];
  error: string | null = null;

  modalOpen = false;
  deleteConfirmOpen = false;
  selectedPromo: any = null;
  deleteTarget: any = null;
  saving = false;

  promoForm!: FormGroup;

  constructor(
    private promosService: PromosService,
    private toast: ToastService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.promoForm = this.fb.group({
      title: ['', Validators.required],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadPromos();
  }

  loadPromos(): void {
    this.loading = true;
    this.error = null;

    this.promosService.list().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
        this.promos = list.map((p: any) => ({
          id: p.id || p.Id || p._id,
          title: p.title || p.Title || 'Untitled Promo',
          description: p.description || p.Description || '',
          discountPercentage: Number(p.discountPercentage || p.DiscountPercentage || 0),
          isActive: p.isActive === true || p.IsActive === true
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load promos';
        this.loading = false;
      }
    });
  }

  trackByPromoId = (_: number, item: any) => item.id;

  openPromoModal(promo?: any): void {
    this.selectedPromo = promo || null;

    if (promo) {
      this.promoForm.patchValue({
        title: promo.title,
        discountPercentage: promo.discountPercentage,
        description: promo.description,
        isActive: promo.isActive
      });
    } else {
      this.promoForm.reset({
        title: '',
        discountPercentage: 0,
        description: '',
        isActive: true
      });
    }
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedPromo = null;
  }

  savePromo(): void {
    if (this.promoForm.invalid || this.saving) return;
    this.saving = true;

    const v = this.promoForm.value;
    const payload = {
      Title: v.title.trim(),
      DiscountPercentage: Number(v.discountPercentage),
      Description: v.description?.trim() || null,
      IsActive: v.isActive
    };

    const request = this.selectedPromo
      ? this.promosService.update(this.selectedPromo.id, payload)
      : this.promosService.create(payload);

    request.subscribe({
      next: () => {
        this.toast.show('Promo saved successfully!', 'success');
        this.saving = false;
        this.closeModal();
        this.loadPromos();
      },
      error: () => {
        this.toast.show('Failed to save promo', 'error');
        this.saving = false;
      }
    });
  }

  toggleActive(promo: any): void {
    this.promosService.update(promo.id, { IsActive: !promo.isActive }).subscribe({
      next: () => {
        this.toast.show('Status updated', 'success');
        this.loadPromos();
      },
      error: () => this.toast.show('Update failed', 'error')
    });
  }

  confirmDelete(promo: any): void {
    this.deleteTarget = promo;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget) return;

    this.promosService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.show('Promo deleted', 'success');
        this.closeAllModals();
        this.loadPromos();
      },
      error: () => this.toast.show('Delete failed', 'error')
    });
  }

  closeAllModals(): void {
    this.modalOpen = false;
    this.deleteConfirmOpen = false;
    this.selectedPromo = null;
    this.deleteTarget = null;
  }
}
