import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { TranslateService } from '../../core/services/translate.service';

interface Filters {
  cores: string[];
  ram: string[];
  storage: string[];
  maxPrice: number | null;
}

interface FilterChip {
  type: string;
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-vps',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './vps.component.html',
  styleUrls: ['./vps.component.css']
})
export class VpsComponent implements OnInit, OnDestroy {
  products: any[] = [];
  loading = false;
  error: string | null = null;

  filters: Filters = {
    cores: [],
    ram: [],
    storage: [],
    maxPrice: null
  };

  cpuOptions = ['1', '2', '4', '6', '8', '12', '16'];
  ramOptions = ['1', '2', '4', '8', '16', '32', '64'];
  storageOptions = ['ssd', 'nvme', 'hdd'];

  filtered: any[] = [];
  filterSidebarOpen = false;

  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  constructor(private http: HttpClient, private router: Router) {}

  text(key: string) {
    return this.translate.t(key);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.http.get(API_ENDPOINTS.VPS.PRODUCTS_LIST).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : (res.data || res || []);
        this.filtered = [...this.products];
        this.updateFilterOptions();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('VPS load error', err);
        this.error = 'Unable to load VPS plans. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateFilterOptions(): void {
    const availableCores = [...new Set(this.products.map(p =>
      String(p.cores || p.Cores || '0')
    ).filter(c => this.cpuOptions.includes(c)))];

    const availableRam = [...new Set(this.products.map(p =>
      String(p.ramGB || p.RamGB || p.RAM || '0')
    ).filter(r => this.ramOptions.includes(r)))];

    this.cpuOptions = availableCores.length > 0 ? availableCores : this.cpuOptions;
    this.ramOptions = availableRam.length > 0 ? availableRam : this.ramOptions;
  }

  // Filter Logic (unchanged)
  isCoreSelected(core: string): boolean {
    return this.filters.cores.includes(core);
  }

  toggleCore(core: string): void {
    const index = this.filters.cores.indexOf(core);
    if (index > -1) {
      this.filters.cores.splice(index, 1);
    } else {
      this.filters.cores.push(core);
    }
    this.onFilterChange();
  }

  isRamSelected(ram: string): boolean {
    return this.filters.ram.includes(ram);
  }

  toggleRam(ram: string): void {
    const index = this.filters.ram.indexOf(ram);
    if (index > -1) {
      this.filters.ram.splice(index, 1);
    } else {
      this.filters.ram.push(ram);
    }
    this.onFilterChange();
  }

  isStorageSelected(type: string): boolean {
    return this.filters.storage.includes(type);
  }

  toggleStorage(type: string): void {
    const index = this.filters.storage.indexOf(type);
    if (index > -1) {
      this.filters.storage.splice(index, 1);
    } else {
      this.filters.storage.push(type);
    }
    this.onFilterChange();
  }

  onPriceChange(): void {
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.applyInstantFilter();
  }

  applyInstantFilter(): void {
    this.filtered = this.products.filter(p => {
      if (this.filters.cores.length > 0) {
        const cores = String(p.cores || p.Cores || p.cpu || p.CPU || '0');
        if (!this.filters.cores.includes(cores)) return false;
      }

      if (this.filters.ram.length > 0) {
        const ram = String(p.ramGB || p.RamGB || p.RAM || p.ram || '0');
        if (!this.filters.ram.includes(ram)) return false;
      }

      if (this.filters.storage.length > 0) {
        const storageType = (p.storageType || p.StorageType || p.storage || p.Storage || '').toLowerCase();
        const hasMatch = this.filters.storage.some(type =>
          storageType.includes(type.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      if (this.filters.maxPrice != null && this.filters.maxPrice > 0) {
        const price = this.getPrice(p);
        if (isNaN(price) || price > this.filters.maxPrice) return false;
      }

      return true;
    });

    this.cdr.detectChanges();
  }

  getActiveFilterCount(): number {
    return this.filters.cores.length +
           this.filters.ram.length +
           this.filters.storage.length +
           (this.filters.maxPrice && this.filters.maxPrice > 0 ? 1 : 0);
  }

  getActiveFilterChips(): FilterChip[] {
    const chips: FilterChip[] = [];

    this.filters.cores.forEach(core => {
      chips.push({
        type: 'cores',
        value: core,
        label: `${core} Core${parseInt(core) > 1 ? 's' : ''}`,
        icon: 'fa-solid fa-microchip'
      });
    });

    this.filters.ram.forEach(ram => {
      chips.push({
        type: 'ram',
        value: ram,
        label: `${ram} GB RAM`,
        icon: 'fa-solid fa-memory'
      });
    });

    this.filters.storage.forEach(type => {
      chips.push({
        type: 'storage',
        value: type,
        label: type.toUpperCase(),
        icon: 'fa-solid fa-hard-drive'
      });
    });

    if (this.filters.maxPrice && this.filters.maxPrice > 0) {
      chips.push({
        type: 'price',
        value: this.filters.maxPrice.toString(),
        label: `Under $${this.filters.maxPrice}`,
        icon: 'fa-solid fa-dollar-sign'
      });
    }

    return chips;
  }

  removeFilterChip(type: string, value: string): void {
    switch (type) {
      case 'cores':
        const coreIndex = this.filters.cores.indexOf(value);
        if (coreIndex > -1) this.filters.cores.splice(coreIndex, 1);
        break;
      case 'ram':
        const ramIndex = this.filters.ram.indexOf(value);
        if (ramIndex > -1) this.filters.ram.splice(ramIndex, 1);
        break;
      case 'storage':
        const storageIndex = this.filters.storage.indexOf(value);
        if (storageIndex > -1) this.filters.storage.splice(storageIndex, 1);
        break;
      case 'price':
        this.filters.maxPrice = null;
        break;
    }
    this.applyInstantFilter();
  }

  resetFilters(): void {
    this.filters = { cores: [], ram: [], storage: [], maxPrice: null };
    this.filtered = [...this.products];
    this.cdr.detectChanges();
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
    document.body.style.overflow = this.filterSidebarOpen ? 'hidden' : '';
  }

  closeFilterSidebar(): void {
    this.filterSidebarOpen = false;
    document.body.style.overflow = '';
  }

  // ──────────────────────────────
  // NEW: Best Servers by Category
  // ──────────────────────────────

  private getPrice(p: any): number {
    return parseFloat(p.price || p.Price || p.cost || '99999') || 99999;
  }

  private getStorageGB(p: any): number {
    return parseInt(p.storageGB || p.StorageGB || '0') || 0;
  }

  private getCores(p: any): number {
    return parseInt(p.cores || p.Cores || '1') || 1;
  }

  // 1. Cheapest with Lowest Storage
  getCheapestLowSpace(): any {
    if (!this.products.length) return null;
    const sorted = [...this.products]
      .filter(p => this.getPrice(p) < 99999)
      .sort((a, b) => {
        const sa = this.getStorageGB(a);
        const sb = this.getStorageGB(b);
        if (sa !== sb) return sa - sb;
        return this.getPrice(a) - this.getPrice(b);
      });
    return sorted[0] || null;
  }

  // 2. Cheapest with Highest Storage
  getCheapestHighSpace(): any {
    if (!this.products.length) return null;
    const sorted = [...this.products]
      .filter(p => this.getPrice(p) < 99999)
      .sort((a, b) => {
        const sa = this.getStorageGB(a);
        const sb = this.getStorageGB(b);
        if (sa !== sb) return sb - sa;
        return this.getPrice(a) - this.getPrice(b);
      });
    return sorted[0] || null;
  }

  // 3. Best Price per Core
  getCheapestByCore(): any {
    if (!this.products.length) return null;
    const valid = this.products
      .filter(p => {
        const price = this.getPrice(p);
        const cores = this.getCores(p);
        return price < 99999 && cores > 0;
      })
      .map(p => ({
        product: p,
        pricePerCore: this.getPrice(p) / this.getCores(p)
      }))
      .sort((a, b) => a.pricePerCore - b.pricePerCore);

    return valid[0]?.product || null;
  }

  trackByFn(index: number, item: any): any {
    return item.id || item.Id || index;
  }

  orderNow(id: number) {
    this.http.get(API_ENDPOINTS.VPS.ORDER_WHATSAPP(id.toString()), { responseType: 'text' as 'json' })
      .subscribe({
        next: (res: any) => {
          const link = (typeof res === 'string') ? res : (res?.link || res?.url);
          if (link && typeof link === 'string') {
            window.open(link, '_blank');
          } else {
            this.openGenericWhatsApp(id);
          }
        },
        error: () => this.openGenericWhatsApp(id)
      });
  }

  private openGenericWhatsApp(id: number) {
    const text = encodeURIComponent(`Hello, I'm interested in VPS plan #${id}. Could you provide more details?`);
    window.open(`https://wa.me/+201063194547?text=${text}`, '_blank');
  }
}
