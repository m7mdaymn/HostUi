import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VpsService } from '../../core/services/vps.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';

@Component({
  selector: 'app-admin-vps-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './vps-list.component.html',
  styleUrls: ['./vps-list.component.css']
})
export class VpsListComponent implements OnInit {
  loading = true;
  vps: any[] = [];
  error: string | null = null;

  modalOpen = false;
  deleteConfirmOpen = false;
  selectedPlan: any = null;
  deleteTarget: any = null;
  saving = false;

  // Dropdown options
  regionOptions = ['france', 'germany', 'europe'];
  categoryOptions = ['LowSpace', 'HighSpace', 'ByCore'];

  vpsForm!: FormGroup;

  constructor(
    private vpsService: VpsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.vpsForm = this.fb.group({
      name: ['', Validators.required],
      region: ['france', Validators.required],
      customRegion: [''],
      cores: [null, [Validators.required, Validators.min(1)]],
      ramGB: [null, [Validators.required, Validators.min(1)]],
      storageGB: [null, [Validators.required, Validators.min(1)]],
      storageType: ['SSD'],
      price: [null, [Validators.required, Validators.min(0)]],
      category: ['LowSpace', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadVPS();
  }

  loadVPS(): void {
    this.loading = true;
    this.error = null;
    this.vps = [];

    this.vpsService.list().subscribe({
      next: (response: any) => {
        let list: any[] = [];

        const extractArray = (data: any): any[] => {
          if (Array.isArray(data)) return data;
          if (data && typeof data === 'object') {
            if (data.data && Array.isArray(data.data)) return data.data;
            if (data.vps && Array.isArray(data.vps)) return data.vps;
            if (data.result && Array.isArray(data.result)) return data.result;
            const found = Object.values(data).find(Array.isArray);
            return found || [];
          }
          return [];
        };

        if (Array.isArray(response)) {
          list = response;
        } else if (response && typeof response === 'object') {
          list = 'data' in response ? extractArray(response.data) : extractArray(response);
        }

        this.vps = list.map((p: any) => ({
          id: p.id ?? p.Id ?? p._id ?? '',
          name: p.name ?? p.Name ?? 'Unnamed Plan',
          region: p.region ?? p.Region ?? '',
          cores: p.cores ?? p.Cores ?? 1,
          ramGB: p.ramGB ?? p.RamGB ?? 1,
          storageGB: p.storageGB ?? p.StorageGB ?? 10,
          storageType: p.storageType ?? p.StorageType ?? 'SSD',
          price: p.price ?? p.Price ?? 0,
          category: p.category ?? p.Category ?? 'LowSpace',
          description: p.description ?? ''
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Load VPS failed:', err);
        this.error = err?.error?.message || 'Failed to load VPS plans';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackByPlanId = (index: number, item: any) => item.id;

  openVpsModal(plan?: any): void {
    this.selectedPlan = plan || null;

    if (plan) {
      const regionLower = (plan.region || '').toString().toLowerCase();
      const isCustom = !this.regionOptions.includes(regionLower);

      this.vpsForm.patchValue({
        name: plan.name || '',
        region: isCustom ? 'custom' : regionLower,
        customRegion: isCustom ? plan.region : '',
        cores: plan.cores || 1,
        ramGB: plan.ramGB || 1,
        storageGB: plan.storageGB || 10,
        storageType: plan.storageType || 'SSD',
        price: plan.price || 0,
        category: plan.category || 'LowSpace',
        description: plan.description || ''
      });
    } else {
      this.vpsForm.reset({
        region: 'france',
        customRegion: '',
        storageType: 'SSD',
        category: 'LowSpace'
      });
    }

    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedPlan = null;
  }

  onRegionChange(): void {
    const region = this.vpsForm.get('region')?.value;
    if (region !== 'custom') {
      this.vpsForm.get('customRegion')?.setValue('');
    }
  }

  savePlan(): void {
    if (this.vpsForm.invalid || this.saving) return;

    const v = this.vpsForm.value;

    // Handle custom region
    let finalRegion = v.region;
    if (v.region === 'custom') {
      if (!v.customRegion?.trim()) {
        alert('Please enter a custom region name');
        return;
      }
      finalRegion = v.customRegion.trim();
    }

    this.saving = true;

    const data = {
      Id: this.selectedPlan?.id || 0,
      Name: v.name?.trim() || '',
      Region: finalRegion,
      Cores: v.cores || 1,
      RamGB: v.ramGB || 1,
      StorageGB: v.storageGB || 10,
      StorageType: v.storageType || 'SSD',
      Price: v.price || 0,
      Category: v.category || 'LowSpace',
      Description: v.description || ''
    };

    const request = this.selectedPlan
      ? this.vpsService.update(this.selectedPlan.id, data)
      : this.vpsService.create(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadVPS();
      },
      error: (err) => {
        console.error('Save failed:', err);
        alert('Failed to save plan: ' + (err?.error?.message || 'Unknown error'));
        this.saving = false;
      }
    });
  }

  confirmDelete(plan: any): void {
    this.deleteTarget = plan;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget) return;

    this.vpsService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleteConfirmOpen = false;
        this.deleteTarget = null;
        this.loadVPS();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Delete failed');
      }
    });
  }

  closeAllModals(): void {
    this.modalOpen = false;
    this.deleteConfirmOpen = false;
    this.selectedPlan = null;
    this.deleteTarget = null;
  }
}
