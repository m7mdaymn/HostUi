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
      connectionSpeedValue: [1, [Validators.required, Validators.min(1)]],
      connectionSpeedUnit: ['Gbps', Validators.required],
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
        const extractArray = (data: any): any[] => {
          if (Array.isArray(data)) return data;
          if (data?.data) return data.data;
          if (data?.vps) return data.vps;
          if (data?.result) return data.result;
          return Object.values(data).find(Array.isArray) || [];
        };

        const list = Array.isArray(response) ? response : extractArray(response);

        this.vps = list.map((p: any) => {
          const speed = this.parseConnectionSpeed(p.ConnectionSpeed || p.connectionSpeed || '1 Gbps');
          return {
            id: p.id ?? p.Id ?? p._id ?? '',
            name: p.name ?? p.Name ?? 'Unnamed Plan',
            region: p.region ?? p.Region ?? '',
            cores: p.cores ?? p.Cores ?? 1,
            ramGB: p.ramGB ?? p.RamGB ?? 1,
            storageGB: p.storageGB ?? p.StorageGB ?? 10,
            storageType: p.storageType ?? p.StorageType ?? 'SSD',
            connectionSpeedValue: speed.value,
            connectionSpeedUnit: speed.unit,
            connectionSpeedDisplay: speed.display,
            price: Number(p.price ?? p.Price ?? 0),
            category: p.category ?? p.Category ?? 'LowSpace',
            description: p.description ?? p.Description ?? ''
          };
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load plans';
        this.loading = false;
      }
    });
  }

  private parseConnectionSpeed(input: string): any {
    if (!input || input.toString().toLowerCase().includes('unmetered')) {
      return { value: null, unit: 'Unmetered', display: 'Unmetered' };
    }
    const match = input.toString().match(/(\d+)\s*(Mbps|Gbps)?/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = (match[2] || (value >= 1000 ? 'Gbps' : 'Mbps')).toLowerCase() === 'mbps' ? 'Mbps' : 'Gbps';
      return { value, unit, display: value ? `${value} ${unit}` : 'Unmetered' };
    }
    return { value: 1, unit: 'Gbps', display: '1 Gbps' };
  }

  trackByPlanId = (index: number, item: any) => item.id;

  openVpsModal(plan?: any): void {
    this.selectedPlan = plan || null;

    if (plan) {
      const regionLower = (plan.region || '').toString().toLowerCase();
      const isCustom = !['france', 'germany', 'europe'].includes(regionLower);

      this.vpsForm.patchValue({
        name: plan.name || '',
        region: isCustom ? 'custom' : regionLower,
        customRegion: isCustom ? plan.region : '',
        cores: plan.cores || 1,
        ramGB: plan.ramGB || 1,
        storageGB: plan.storageGB || 10,
        storageType: plan.storageType || 'SSD',
        connectionSpeedValue: plan.connectionSpeedValue ?? 1,
        connectionSpeedUnit: plan.connectionSpeedUnit ?? 'Gbps',
        price: plan.price || 0,
        category: plan.category || 'LowSpace',
        description: plan.description || ''
      });
    } else {
      this.vpsForm.reset({
        region: 'france',
        customRegion: '',
        storageType: 'SSD',
        connectionSpeedValue: 10,
        connectionSpeedUnit: 'Gbps',
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
    if (this.vpsForm.get('region')?.value !== 'custom') {
      this.vpsForm.get('customRegion')?.setValue('');
    }
  }

  savePlan(): void {
    if (this.vpsForm.invalid || this.saving) return;

    const v = this.vpsForm.value;
    let finalRegion = v.region === 'custom' ? v.customRegion?.trim() : v.region;
    if (v.region === 'custom' && !finalRegion) {
      alert('Custom region name is required');
      return;
    }

    const speedValue = v.connectionSpeedValue;
    const speedUnit = v.connectionSpeedUnit;
    const connectionSpeed = speedUnit === 'Unmetered' ? 'Unmetered' : `${speedValue} ${speedUnit}`;

    this.saving = true;

    const data = {
      Id: this.selectedPlan?.id || 0,
      Name: v.name.trim(),
      Region: finalRegion,
      Cores: Number(v.cores),
      RamGB: Number(v.ramGB),
      StorageGB: Number(v.storageGB),
      StorageType: v.storageType,
      ConnectionSpeed: connectionSpeed,   // Saved exactly as "10 Gbps" or "Unmetered"
      Price: Number(v.price),
      Category: v.category,
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
        alert('Save failed: ' + (err?.error?.message || 'Unknown error'));
        this.saving = false;
      }
    });
  }

  confirmDelete(plan: any): void {
    this.deleteTarget = plan;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed(): void {
    this.vpsService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.closeAllModals();
        this.loadVPS();
      },
      error: () => alert('Delete failed')
    });
  }

  closeAllModals(): void {
    this.modalOpen = false;
    this.deleteConfirmOpen = false;
    this.selectedPlan = null;
    this.deleteTarget = null;
  }
}
