import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DedicatedService } from '../../core/services/dedicated.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';

@Component({
  selector: 'app-dedicated',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe, AdminTopbarComponent, AdminSidebarComponent],
  templateUrl: './dedicated.component.html',
  styleUrl: './dedicated.component.css'
})
export class DedicatedComponent implements OnInit {
  loading = true;
  servers: any[] = [];
  error: string | null = null;
  modalOpen = false;
  deleteConfirmOpen = false;
  selectedServer: any = null;
  deleteTarget: any = null;
  saving = false;

  cpuBrands = ['AMD', 'Intel'];

  serverForm!: FormGroup;

  constructor(
    private dedicatedService: DedicatedService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.serverForm = this.fb.group({
      cpuBrand: ['AMD', Validators.required],
      cpuModel: ['', Validators.required],
      cores: [null, [Validators.required, Validators.min(1)]],
      ramGB: [null, [Validators.required, Validators.min(1)]],
      storage: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      brand: ['', Validators.required],
      bandwidth: [''],
      inStock: [true],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadServers();
  }

  loadServers(): void {
    this.loading = true;
    this.error = null;
    this.servers = [];

    this.dedicatedService.list().subscribe({
      next: (response: any) => {
        let list: any[] = [];
        const extractArray = (data: any): any[] => {
          if (Array.isArray(data)) return data;
          if (data && typeof data === 'object') {
            if (data.data && Array.isArray(data.data)) return data.data;
            if (data.servers && Array.isArray(data.servers)) return data.servers;
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

        this.servers = list.map((s: any) => ({
          id: s.id ?? s.Id ?? s._id ?? '',
          cpuModel: s.cpuModel ?? s.CpuModel ?? 'Unknown',
          cores: s.cores ?? s.Cores ?? 1,
          ramGB: s.ramGB ?? s.RamGB ?? 1,
          storage: s.storage ?? s.Storage ?? '500GB',
          price: s.price ?? s.Price ?? 0,
          brand: s.brand ?? s.Brand ?? 'Generic',
          bandwidth: s.bandwidth ?? s.Bandwidth ?? 'Unlimited',
          inStock: s.inStock ?? s.InStock ?? true,
          description: s.description ?? ''
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load dedicated servers';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackByServerId = (index: number, item: any): any => item.id || index;

  openServerModal(server?: any): void {
    this.selectedServer = server || null;

    if (server) {
      const model = (server.cpuModel || '').trim();
      const isAMD = model.toLowerCase().includes('ryzen') ||
                    model.toLowerCase().includes('epyc') ||
                    model.toLowerCase().includes('threadripper');

      this.serverForm.patchValue({
        cpuBrand: isAMD ? 'AMD' : 'Intel',
        cpuModel: model,
        cores: server.cores || 1,
        ramGB: server.ramGB || 1,
        storage: server.storage || '',
        price: server.price || 0,
        brand: server.brand || '',
        bandwidth: server.bandwidth || '',
        inStock: server.inStock ?? true,
        description: server.description || ''
      });
    } else {
      this.serverForm.reset({
        cpuBrand: 'AMD',
        cpuModel: '',
        cores: 1,
        ramGB: 1,
        storage: '',
        price: 0,
        brand: '',
        bandwidth: '',
        inStock: true,
        description: ''
      });
    }

    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedServer = null;
    this.serverForm.reset();
  }

  saveServer(): void {
    if (this.serverForm.invalid || this.saving) return;

    this.saving = true;
    const v = this.serverForm.value;
    const fullCpuModel = `${v.cpuBrand} ${v.cpuModel}`.trim();

    const payload = this.selectedServer
      ? {
          Id: this.selectedServer.id,
          CpuModel: fullCpuModel,
          Cores: +v.cores,
          RamGB: +v.ramGB,
          Storage: v.storage?.trim(),
          Price: +v.price,
          Brand: v.brand?.trim(),
          Bandwidth: v.bandwidth?.trim() || 'Unlimited',
          InStock: !!v.inStock,
          Description: v.description?.trim() || ''
        }
      : {
          CpuModel: fullCpuModel,
          Cores: +v.cores,
          RamGB: +v.ramGB,
          Storage: v.storage?.trim(),
          Price: +v.price,
          Brand: v.brand?.trim(),
          Bandwidth: v.bandwidth?.trim() || 'Unlimited',
          InStock: true,
          Description: v.description?.trim() || ''
        };

    const request = this.selectedServer
      ? this.dedicatedService.update(this.selectedServer.id, payload)
      : this.dedicatedService.create(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadServers();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to save server');
        this.saving = false;
      }
    });
  }

  confirmDelete(server: any): void {
    this.deleteTarget = server;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget?.id) return;

    this.dedicatedService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleteConfirmOpen = false;
        this.deleteTarget = null;
        this.loadServers();
      },
      error: () => {
        alert('Failed to delete server');
      }
    });
  }

  closeAllModals(): void {
    this.modalOpen = false;
    this.deleteConfirmOpen = false;
    this.selectedServer = null;
    this.deleteTarget = null;
    this.serverForm.reset();
  }
}
