import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { TranslateService } from '../../core/services/translate.service';

interface Filters {
  cores: string[];
  ram: string[];
  storage: string[];
  maxPrice: number | null;
}

@Component({
  selector: 'app-vps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vps.component.html',
  styleUrls: ['./vps.component.css']
})
export class VpsComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filtered: any[] = [];
  loading = false;
  error: string | null = null;
  filterSidebarOpen = false;
  whatsappLink = '';

  filters: Filters = { cores: [], ram: [], storage: [], maxPrice: null };
  cpuOptions = ['1', '2', '4', '6', '8', '12', '16'];
  ramOptions = ['1', '2', '4', '8', '16', '32', '64'];
  storageOptions = ['ssd', 'nvme', 'hdd'];

  private translate = inject(TranslateService);
  private http = inject(HttpClient);

  text(key: string): string {
    return this.translate.t(key);
  }

  ngOnInit(): void {
    this.updateWhatsAppLink();
    this.loadProducts();

    this.translate.lang.subscribe(() => {
      this.updateWhatsAppLink();
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  private updateWhatsAppLink(): void {
    const msg = this.translate.current === 'ar'
      ? 'مرحباً، أنا مهتم بخدمات الاستضافة VPS'
      : "Hello, I'm interested in your VPS hosting services!";
    this.whatsappLink = `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.http.get(API_ENDPOINTS.VPS.PRODUCTS_LIST).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : (res.data || []);
        this.filtered = [...this.products];
        this.loading = false;
      },
      error: () => {
        this.error = this.text('unableToLoadVps') || 'Unable to load VPS plans.';
        this.loading = false;
      }
    });
  }

  isCoreSelected(core: string): boolean { return this.filters.cores.includes(core); }
  toggleCore(core: string): void {
    const i = this.filters.cores.indexOf(core);
    i === -1 ? this.filters.cores.push(core) : this.filters.cores.splice(i, 1);
    this.applyInstantFilter();
  }

  isRamSelected(ram: string): boolean { return this.filters.ram.includes(ram); }
  toggleRam(ram: string): void {
    const i = this.filters.ram.indexOf(ram);
    i === -1 ? this.filters.ram.push(ram) : this.filters.ram.splice(i, 1);
    this.applyInstantFilter();
  }

  isStorageSelected(type: string): boolean { return this.filters.storage.includes(type); }
  toggleStorage(type: string): void {
    const i = this.filters.storage.indexOf(type);
    i === -1 ? this.filters.storage.push(type) : this.filters.storage.splice(i, 1);
    this.applyInstantFilter();
  }

  applyInstantFilter(): void {
    this.filtered = this.products.filter(p => {
      if (this.filters.cores.length) {
        const cores = String(p.cores || p.Cores || '0');
        if (!this.filters.cores.includes(cores)) return false;
      }
      if (this.filters.ram.length) {
        const ram = String(p.ramGB || p.RamGB || '0');
        if (!this.filters.ram.includes(ram)) return false;
      }
      if (this.filters.storage.length) {
        const type = (p.storageType || p.StorageType || '').toLowerCase();
        const match = this.filters.storage.some(t => type.includes(t));
        if (!match) return false;
      }
      if (this.filters.maxPrice != null && this.filters.maxPrice > 0) {
        const price = this.getPrice(p);
        if (price > this.filters.maxPrice) return false;
      }
      return true;
    });
  }

  getActiveFilterCount(): number {
    return this.filters.cores.length + this.filters.ram.length + this.filters.storage.length + (this.filters.maxPrice ? 1 : 0);
  }

  resetFilters(): void {
    this.filters = { cores: [], ram: [], storage: [], maxPrice: null };
    this.filtered = [...this.products];
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
    document.body.style.overflow = this.filterSidebarOpen ? 'hidden' : '';
  }

  closeFilterSidebar(): void {
    this.filterSidebarOpen = false;
    document.body.style.overflow = '';
  }

  private getPrice(p: any): number {
    return parseFloat(p.price || p.Price || '99999') || 99999;
  }

  private getStorageGB(p: any): number {
    return parseInt(p.storageGB || p.StorageGB || '0') || 0;
  }

  private getCores(p: any): number {
    return parseInt(p.cores || p.Cores || '1') || 1;
  }

  getCheapestLowSpace(): any {
    return [...this.products]
      .filter(p => this.getPrice(p) < 99999)
      .sort((a, b) => this.getStorageGB(a) - this.getStorageGB(b) || this.getPrice(a) - this.getPrice(b))[0] || null;
  }

  getCheapestHighSpace(): any {
    return [...this.products]
      .filter(p => this.getPrice(p) < 99999)
      .sort((a, b) => this.getStorageGB(b) - this.getStorageGB(a) || this.getPrice(a) - this.getPrice(b))[0] || null;
  }

  getCheapestByCore(): any {
    return this.products
      .filter(p => this.getPrice(p) < 99999 && this.getCores(p) > 0)
      .map(p => ({ p, ppc: this.getPrice(p) / this.getCores(p) }))
      .sort((a, b) => a.ppc - b.ppc)[0]?.p || null;
  }

  trackByFn = (index: number, item: any) => item?.id || item?.Id || index;

  orderNow(id: number): void {
    this.http.get(API_ENDPOINTS.VPS.ORDER_WHATSAPP(id.toString()), { responseType: 'text' as 'json' })
      .subscribe({
        next: (res: any) => {
          const link = typeof res === 'string' ? res : (res?.link || res?.url || '');
          window.open(link || `https://wa.me/+201063194547?text=I'm interested in VPS #${id}`, '_blank');
        },
        error: () => window.open(`https://wa.me/+201063194547?text=I'm interested in VPS #${id}`, '_blank')
      });
  }
}
