// src/app/admin/packages/packages-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackagesService } from '../../core/services/packages.service';
import { VpsService } from '../../core/services/vps.service';
import { DedicatedService } from '../../core/services/dedicated.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';
import { HttpErrorResponse } from '@angular/common/http';
import { PackageItemsService } from '../../core/services/packageitems.service';

@Component({
  selector: 'app-admin-packages-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './packages-list.component.html',
  styleUrls: ['./packages-list.component.css']
})
export class PackagesListComponent implements OnInit {
  loading = true;
  packages: any[] = [];
  items: any[] = [];
  vps: any[] = [];
  dedicated: any[] = [];
  error: string | null = null;

  modalOpen = false;
  itemsModalOpen = false;
  deleteConfirmOpen = false;
  selectedPackage: any = null;
  deleteTarget: any = null;
  saving = false;

  productMap: { [key: string]: { name: string; description: string } } = {};

  packageForm!: FormGroup;
  itemForm!: FormGroup;

  constructor(
    private packagesService: PackagesService,
    private packageItemsService: PackageItemsService,
    private vpsService: VpsService,
    private dedicatedService: DedicatedService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      durationMonths: [null, [Validators.required, Validators.min(1)]],
      totalPrice: [null, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    this.itemForm = this.fb.group({
      productType: ['vps', Validators.required],
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();    // Load VPS + Dedicated first
    this.loadPackages();
  }

  loadProducts(): void {
    // Load VPS
    this.vpsService.list().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        list.forEach((v: any) => {
          const id = v.id ?? v._id ?? v.Id;
          if (id) this.productMap[id] = { name: v.name ?? 'VPS Server', description: v.description ?? 'Virtual Private Server' };
        });
      },
      error: (err) => console.error('Failed to load VPS:', err)
    });

    // Load Dedicated
    this.dedicatedService.list().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        list.forEach((d: any) => {
          const id = d.id ?? d._id ?? d.Id;
          if (id) this.productMap[id] = { name: d.brand ?? d.name ?? 'Dedicated Server', description: d.description ?? 'Dedicated Server' };
        });
      },
      error: (err) => console.error('Failed to load Dedicated:', err)
    });
  }

  loadPackages(): void {
    this.loading = true;
    this.error = null;
    this.packagesService.list().subscribe({
      next: (response: any) => {
        const extractArray = (data: any): any[] => {
          if (Array.isArray(data)) return data;
          if (data?.data) return Array.isArray(data.data) ? data.data : [];
          if (data?.packages) return Array.isArray(data.packages) ? data.packages : [];
          return Object.values(data).find(Array.isArray) || [];
        };

        const list = Array.isArray(response) ? response : extractArray(response);

        this.packages = list.map((p: any) => ({
          id: p.id ?? p.Id ?? p._id ?? '',
          name: p.name ?? p.Name ?? 'Unnamed Package',
          durationMonths: p.durationMonths ?? p.DurationMonths ?? 1,
          totalPrice: p.totalPrice ?? p.TotalPrice ?? 0,
          description: p.description ?? p.Description ?? ''
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load packages';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackByPackageId = (index: number, item: any) => item.id;

  openPackageModal(pkg?: any): void {
    this.selectedPackage = pkg || null;
    if (pkg) {
      this.packageForm.patchValue({
        name: pkg.name,
        durationMonths: pkg.durationMonths,
        totalPrice: pkg.totalPrice,
        description: pkg.description
      });
    } else {
      this.packageForm.reset({ durationMonths: 1, totalPrice: 0 });
    }
    this.modalOpen = true;
  }

  closePackageModal(): void {
    this.modalOpen = false;
    this.selectedPackage = null;
    this.packageForm.reset();
  }

  savePackage(): void {
    if (this.packageForm.invalid || this.saving) return;
    this.saving = true;

    const v = this.packageForm.value;
    const data = {
      Name: v.name.trim(),
      DurationMonths: +v.durationMonths,
      TotalPrice: +v.totalPrice,
      Description: v.description || ''
    };

    const request = this.selectedPackage
      ? this.packagesService.update(this.selectedPackage.id, data)
      : this.packagesService.create(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closePackageModal();
        this.loadPackages();
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'Failed to save package');
        this.saving = false;
      }
    });
  }

  openItemsModal(pkg: any): void {
    this.selectedPackage = pkg;
    this.loadPackageItems(pkg.id);
    this.itemsModalOpen = true;
  }

  closeItemsModal(): void {
    this.itemsModalOpen = false;
    this.selectedPackage = null;
    this.items = [];
  }

  loadPackageItems(packageId: string): void {
    this.packageItemsService.getItems(packageId).subscribe({
      next: (response: any) => {
        const raw = Array.isArray(response) ? response : (response?.data || response?.items || []);
        this.items = raw.map((item: any) => {
          const prod = this.productMap[item.productId] || { name: 'Unknown Product', description: '—' };
          return {
            ...item,
            productName: prod.name,
            productDescription: prod.description,
            displayType: item.productType === 'vps' ? 'VPS' : 'Dedicated'
          };
        });
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Load items failed:', err);
        this.items = [];
      }
    });
  }

  onProductTypeChange(): void {
    this.itemForm.patchValue({ productId: '' });
  }

  get currentProducts(): any[] {
    return this.itemForm.value.productType === 'vps' ? this.vps : this.dedicated;
  }

  addItem(): void {
    if (this.itemForm.invalid) return;

    const v = this.itemForm.value;
    const data = {
      PackageId: this.selectedPackage.id,
      ProductType: v.productType,
      ProductId: v.productId,
      Quantity: +v.quantity,
      Note: v.note || ''
    };

    this.packageItemsService.addItem(data).subscribe({
      next: () => {
        this.itemForm.patchValue({ productId: '', note: '', quantity: 1 });
        this.loadPackageItems(this.selectedPackage.id);
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'Failed to add item');
      }
    });
  }

  deleteItem(itemId: string): void {
    if (!confirm('Remove this item from package?')) return;
    this.packageItemsService.deleteItem(itemId).subscribe({
      next: () => this.loadPackageItems(this.selectedPackage.id),
      error: () => alert('Failed to delete item')
    });
  }

  confirmDelete(pkg: any): void {
    this.deleteTarget = pkg;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget) return;
    this.packagesService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleteConfirmOpen = false;
        this.deleteTarget = null;
        this.loadPackages();
      },
      error: () => alert('Failed to delete package')
    });
  }

  closeAllModals(): void {
    this.modalOpen = this.itemsModalOpen = this.deleteConfirmOpen = false;
    this.selectedPackage = this.deleteTarget = null;
  }
}
