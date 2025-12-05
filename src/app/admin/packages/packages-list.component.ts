// src/app/admin/packages/packages-list.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackagesService } from '../../core/services/packages.service';
import { PackageItemsService } from '../../core/services/packageitems.service';
import { VpsService } from '../../core/services/vps.service';
import { DedicatedService } from '../../core/services/dedicated.service';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../shared/admin-topbar/admin-topbar.component';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-packages-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './packages-list.component.html',
  styleUrls: ['./packages-list.component.css']
})
export class PackagesListComponent implements OnInit {
  packages: any[] = [];
  items: any[] = [];
  vps: any[] = [];
  dedicated: any[] = [];

  loading = true;
  productsLoading = true;
  error: string | null = null;

  modalOpen = false;
  itemsModalOpen = false;
  deleteConfirmOpen = false;
  saving = false;

  selectedPackage: any = null;
  deleteTarget: any = null;

  packageForm!: FormGroup;
  itemForm!: FormGroup;

  // Maps product ID → name & description
  productMap: { [key: string]: { name: string; description: string; type: string } } = {};

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
      durationMonths: [1, [Validators.required, Validators.min(1)]],
      totalPrice: [0, [Validators.required, Validators.min(0)]],
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
    this.loadProducts();
    this.loadPackages();
  }

  // Helper method to extract ID from any object with various field names
  private extractId(obj: any): string | null {
    const id = obj?.id ?? obj?._id ?? obj?.Id ?? null;
    return id ? String(id) : null;
  }

  // Load VPS + Dedicated servers → fill dropdown + productMap
  loadProducts(): void {
    this.productsLoading = true;

    forkJoin([
      this.vpsService.list(),
      this.dedicatedService.list()
    ]).subscribe({
      next: ([vpsRes, dedRes]) => {
        this.vps = this.extractArray(vpsRes);
        this.dedicated = this.extractArray(dedRes);

        console.log('Loaded VPS:', this.vps);
        console.log('Loaded Dedicated:', this.dedicated);

        // Fill productMap with ALL VPS servers
        this.vps.forEach(item => {
          const id = this.extractId(item);
          if (id) {
            this.productMap[id] = {
              name: item.name || item.brand || item.Name || 'Unnamed VPS',
              description: [
                item.ram ? `${item.ram}GB RAM` : '',
                item.cpu || item.cores ? `${item.cpu || item.cores} CPU` : '',
                item.storage ? `${item.storage}` : ''
              ].filter(Boolean).join(' • ') || 'No specs',
              type: 'vps'
            };
          }
        });

        // Fill productMap with ALL Dedicated servers
        this.dedicated.forEach(item => {
          const id = this.extractId(item);
          if (id) {
            this.productMap[id] = {
              name: item.name || item.brand || item.Name || 'Unnamed Dedicated',
              description: [
                item.ram ? `${item.ram}GB RAM` : '',
                item.cpu || item.cores ? `${item.cpu || item.cores} CPU` : '',
                item.storage ? `${item.storage}` : ''
              ].filter(Boolean).join(' • ') || 'No specs',
              type: 'dedicated'
            };
          }
        });

        console.log('Product map built:', this.productMap);
        console.log('Total products in map:', Object.keys(this.productMap).length);

        this.productsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.productsLoading = false;
        alert('Failed to load servers. Dropdown will be empty.');
      }
    });
  }

  private extractArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res?.data) return Array.isArray(res.data) ? res.data : [];
    if (res?.items) return Array.isArray(res.items) ? res.items : [];
    return [];
  }

  loadPackages(): void {
    this.loading = true;
    this.packagesService.list().subscribe({
      next: (res: any) => {
        const list = this.extractArray(res);
        this.packages = list.map((p: any) => ({
          id: this.extractId(p),
          name: p.name || p.Name || 'Unnamed Package',
          durationMonths: p.durationMonths || p.DurationMonths || 1,
          totalPrice: p.totalPrice || p.TotalPrice || 0,
          description: p.description || p.Description || ''
        }));
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load packages';
        this.loading = false;
      }
    });
  }

  // Package Modals
  openPackageModal(pkg?: any) {
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

  closePackageModal() {
    this.modalOpen = false;
    this.selectedPackage = null;
  }

  savePackage() {
    if (this.packageForm.invalid || this.saving) return;
    this.saving = true;

    const v = this.packageForm.value;
    const payload = {
      Name: v.name.trim(),
      DurationMonths: +v.durationMonths,
      TotalPrice: +v.totalPrice,
      Description: v.description || ''
    };

    const req = this.selectedPackage
      ? this.packagesService.update(this.selectedPackage.id, payload)
      : this.packagesService.create(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.closePackageModal();
        this.loadPackages();
      },
      error: (err) => {
        console.error('Failed to save package:', err);
        alert('Failed to save package');
        this.saving = false;
      }
    });
  }

  // Items Modal
  openItemsModal(pkg: any) {
    this.selectedPackage = pkg;
    this.loadPackageItems(pkg.id);
    this.itemForm.reset({ productType: 'vps', productId: '', quantity: 1, note: '' });
    this.itemsModalOpen = true;
  }

  closeItemsModal() {
    this.itemsModalOpen = false;
    this.selectedPackage = null;
    this.items = [];
  }

  // FIXED: Read vpsId/dedicatedId based on productType
  loadPackageItems(packageId: string) {
    console.log('Loading items for package:', packageId);

    this.packageItemsService.getItems(packageId).subscribe({
      next: (res: any) => {
        console.log('Raw API response:', res);
        const raw = this.extractArray(res);

        this.items = raw.map((item: any) => {
          // Backend uses vpsId for VPS and dedicatedId for Dedicated
          const productType = (item.productType || item.ProductType || '').toLowerCase();

          let productId: string | null = null;
          if (productType === 'vps') {
            productId = item.vpsId ? String(item.vpsId) : null;
          } else if (productType === 'dedicated') {
            productId = item.dedicatedId ? String(item.dedicatedId) : null;
          }

          console.log(`Item type: ${productType}, ProductId: ${productId}`);

          // Look up product in map
          const prod = productId && this.productMap[productId]
            ? this.productMap[productId]
            : {
                name: productId
                  ? `Unknown Product (ID: ${productId})`
                  : `⚠️ No ${productType.toUpperCase()} ID saved`,
                description: productId
                  ? 'Product not found in catalog'
                  : 'Backend did not save the product ID correctly',
                type: productType
              };

          return {
            id: this.extractId(item),
            productId: productId,
            productName: prod.name,
            productDescription: prod.description,
            displayType: productType === 'vps' ? 'VPS' : 'Dedicated',
            quantity: item.quantity ?? item.Quantity ?? 1,
            note: item.note ?? item.Note ?? '—'
          };
        });

        console.log('Mapped items:', this.items);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load package items:', err);
        this.items = [];
        alert('Failed to load package items');
      }
    });
  }

  get currentProducts() {
    const type = this.itemForm.get('productType')?.value || 'vps';
    return type === 'vps' ? this.vps : this.dedicated;
  }

  onProductTypeChange() {
    this.itemForm.patchValue({ productId: '' });
  }

  // FIXED: Send vpsId or dedicatedId instead of ProductId
  addItem() {
    if (this.itemForm.invalid) return;

    const v = this.itemForm.value;
    const productType = v.productType.toLowerCase();

    // Build payload with correct field names based on type
    const payload: any = {
      PackageId: this.selectedPackage.id,
      ProductType: productType,
      Quantity: +v.quantity,
      Note: v.note || ''
    };

    // Add the correct ID field based on product type
    if (productType === 'vps') {
      payload.VpsId = +v.productId; // Convert to number
    } else if (productType === 'dedicated') {
      payload.DedicatedId = +v.productId; // Convert to number
    }

    console.log('Adding item with payload:', payload);

    this.packageItemsService.addItem(payload).subscribe({
      next: (response) => {
        console.log('Item added successfully:', response);
        this.itemForm.patchValue({ productId: '', note: '', quantity: 1 });
        this.loadPackageItems(this.selectedPackage.id);
      },
      error: (err) => {
        console.error('Failed to add item:', err);
        console.error('Error details:', err.error);
        alert('Failed to add item: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteItem(itemId: string) {
    if (!confirm('Remove this item from package?')) return;

    this.packageItemsService.deleteItem(itemId).subscribe({
      next: () => this.loadPackageItems(this.selectedPackage.id),
      error: (err) => {
        console.error('Failed to delete item:', err);
        alert('Failed to delete item');
      }
    });
  }

  confirmDelete(pkg: any) {
    this.deleteTarget = pkg;
    this.deleteConfirmOpen = true;
  }

  deleteConfirmed() {
    if (!this.deleteTarget) return;

    this.packagesService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleteConfirmOpen = false;
        this.deleteTarget = null;
        this.loadPackages();
      },
      error: (err) => {
        console.error('Failed to delete package:', err);
        alert('Failed to delete package');
      }
    });
  }

  closeAllModals() {
    this.modalOpen = this.itemsModalOpen = this.deleteConfirmOpen = false;
    this.selectedPackage = this.deleteTarget = null;
  }

  trackByPackageId = (_: number, item: any) => item.id;
}
