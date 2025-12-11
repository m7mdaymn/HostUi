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

  serverForm!: FormGroup;

  constructor(
    private dedicatedService: DedicatedService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.serverForm = this.fb.group({
      name: ['', Validators.required],
      cpuBrand: ['AMD', Validators.required],
      cpuModel: ['', Validators.required],
      cores: [null, [Validators.required, Validators.min(1)]],
      ramGB: [null, [Validators.required, Validators.min(1)]],
      storage: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      brand: ['', Validators.required],
      connectionSpeedValue: [null],  // Optional numeric value
      connectionSpeedUnit: [''],     // Allow empty string as default
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
          name: s.name ?? s.Name ?? '',
          cpuModel: s.cpuModel ?? s.CpuModel ?? 'Unknown',
          cores: s.cores ?? s.Cores ?? 1,
          ramGB: s.ramGB ?? s.RamGB ?? 1,
          storage: s.storage ?? s.Storage ?? '',
          price: s.price ?? s.Price ?? 0,
          brand: s.brand ?? s.Brand ?? 'Generic',
          connectionSpeed: s.connectionSpeed ?? s.ConnectionSpeed ?? '',
          inStock: s.isActive ?? s.IsActive ?? s.inStock ?? s.InStock ?? true,
          description: s.description ?? s.Description ?? ''
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
      // Parse existing connectionSpeed (e.g., "10 Gbps", "1000 Mbps", "Unmetered")
      const { value, unit } = this.parseConnectionSpeed(server.connectionSpeed || '');

      // Extract CPU brand and model from the full cpuModel string
      const { brand, model } = this.extractCpuBrandAndModel(server.cpuModel || '');

      this.serverForm.patchValue({
        name: server.name || '',
        cpuBrand: brand,
        cpuModel: model,
        cores: server.cores || 1,
        ramGB: server.ramGB || 1,
        storage: server.storage || '',
        price: server.price || 0,
        brand: server.brand || '',
        connectionSpeedValue: value,
        connectionSpeedUnit: unit,
        inStock: server.inStock ?? true,
        description: server.description || ''
      });
    } else {
      this.serverForm.reset({
        name: '',
        cpuBrand: 'AMD',
        cpuModel: '',
        cores: 1,
        ramGB: 1,
        storage: '',
        price: 0,
        brand: '',
        connectionSpeedValue: null,
        connectionSpeedUnit: '',
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

  // Extract CPU brand and model from stored cpuModel string
  private extractCpuBrandAndModel(cpuModel: string): { brand: string; model: string } {
    if (!cpuModel || !cpuModel.trim()) {
      return { brand: 'AMD', model: '' };
    }

    const trimmed = cpuModel.trim();

    // Check if starts with AMD or Intel (case insensitive)
    if (trimmed.toLowerCase().startsWith('amd')) {
      // Remove 'AMD' from the beginning (with any duplicates)
      const model = trimmed.replace(/^(amd\s*)+/i, '').trim();
      return { brand: 'AMD', model };
    } else if (trimmed.toLowerCase().startsWith('intel')) {
      // Remove 'Intel' from the beginning (with any duplicates)
      const model = trimmed.replace(/^(intel\s*)+/i, '').trim();
      return { brand: 'Intel', model };
    }

    // If no recognized brand, default to AMD and use full string as model
    return { brand: 'AMD', model: trimmed };
  }

  // Parse connectionSpeed string into value and unit
  private parseConnectionSpeed(speed: string): { value: number | null; unit: string } {
    if (!speed || !speed.trim()) {
      return { value: null, unit: '' };
    }

    const trimmed = speed.trim();

    // Check for "Unmetered"
    if (trimmed.toLowerCase().includes('unmetered')) {
      return { value: null, unit: 'Unmetered' };
    }

    // Extract number and unit (e.g., "10 Gbps", "1000Mbps", "10Gbps")
    const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(Mbps|Gbps)/i);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase() // Normalize to Mbps/Gbps
      };
    }

    // Fallback: return as-is or empty
    return { value: null, unit: '' };
  }

  // Combine connectionSpeedValue + connectionSpeedUnit into a single string
  private buildConnectionSpeed(value: number | null, unit: string): string {
    // If unit is empty or not selected, return empty string
    if (!unit || unit.trim() === '') {
      return '';
    }

    if (unit === 'Unmetered') {
      return 'Unmetered';
    }

    if (!value || value <= 0) {
      return '';
    }

    return `${value} ${unit}`;
  }

  saveServer(): void {
    if (this.serverForm.invalid || this.saving) return;

    this.saving = true;
    const v = this.serverForm.value;

    // Build connectionSpeed string
    const connectionSpeed = this.buildConnectionSpeed(v.connectionSpeedValue, v.connectionSpeedUnit);

    // Build CPU model - only add brand prefix if model doesn't already start with it
    let cpuModelFull = v.cpuModel?.trim() || '';
    const cpuBrand = v.cpuBrand?.trim() || 'AMD';

    // Check if the model already starts with the brand name
    if (cpuModelFull && !cpuModelFull.toLowerCase().startsWith(cpuBrand.toLowerCase())) {
      cpuModelFull = `${cpuBrand} ${cpuModelFull}`;
    }

    const payload = this.selectedServer
      ? {
          Id: this.selectedServer.id,
          Name: v.name.trim(),
          CpuModel: cpuModelFull,
          Cores: +v.cores,
          RamGB: +v.ramGB,
          Storage: v.storage?.trim(),
          Price: +v.price,
          Brand: v.brand?.trim(),
          ConnectionSpeed: connectionSpeed,
          IsActive: !!v.inStock,
          Description: v.description?.trim() || ''
        }
      : {
          Name: v.name.trim(),
          CpuModel: cpuModelFull,
          Cores: +v.cores,
          RamGB: +v.ramGB,
          Storage: v.storage?.trim(),
          Price: +v.price,
          Brand: v.brand?.trim(),
          ConnectionSpeed: connectionSpeed,
          IsActive: true,
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
      error: () => alert('Failed to delete server')
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
