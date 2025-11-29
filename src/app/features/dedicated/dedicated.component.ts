import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { TranslateService } from '../../core/services/translate.service';

interface Filters {
  cores: string[];
  ram: string[];
  brands: string[];
  maxPrice: number | null;
}

@Component({
  selector: 'app-dedicated',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './dedicated.component.html',
  styleUrls: ['../vps/vps.component.css']
})
export class DedicatedComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filtered: any[] = [];
  loading = false;
  error: string | null = null;
  filterSidebarOpen = false;

  filters: Filters = { cores: [], ram: [], brands: [], maxPrice: null };
  cpuOptions = ['2','4','6','8','12','16','24','32'];
  ramOptions = ['16','32','64','128','256','512'];
  brandOptions: string[] = [];

  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  text(key: string) { return this.translate.t(key); }

  ngOnInit(): void { this.loadProducts(); }
  ngOnDestroy(): void { document.body.style.overflow = ''; }

  loadProducts(): void {
    this.loading = true;
    this.http.get(API_ENDPOINTS.DEDICATED.PRODUCTS_LIST).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : (res.data || []);
        this.filtered = [...this.products];
        const brands = this.products.map(p => (p.brand || p.Brand || p.cpuModel || '').trim()).filter(Boolean);
        this.brandOptions = Array.from(new Set(brands));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Unable to load dedicated servers. Please try again later.';
        this.loading = false;
      }
    });
  }

  isCoreSelected(c: string) { return this.filters.cores.includes(c); }
  toggleCore(c: string) {
    const i = this.filters.cores.indexOf(c);
    i === -1 ? this.filters.cores.push(c) : this.filters.cores.splice(i, 1);
    this.applyInstantFilter();
  }

  isRamSelected(r: string) { return this.filters.ram.includes(r); }
  toggleRam(r: string) {
    const i = this.filters.ram.indexOf(r);
    i === -1 ? this.filters.ram.push(r) : this.filters.ram.splice(i, 1);
    this.applyInstantFilter();
  }

  isBrandSelected(b: string) { return this.filters.brands.includes(b); }
  toggleBrand(b: string) {
    const i = this.filters.brands.indexOf(b);
    i === -1 ? this.filters.brands.push(b) : this.filters.brands.splice(i, 1);
    this.applyInstantFilter();
  }

  onPriceChange() { this.applyInstantFilter(); }

  applyInstantFilter() {
    this.filtered = this.products.filter(p => {
      if (this.filters.cores.length && !this.filters.cores.includes(String(p.cores || p.Cores || ''))) return false;
      if (this.filters.ram.length && !this.filters.ram.includes(String(p.ramGB || p.RamGB || ''))) return false;
      if (this.filters.brands.length) {
        const b = (p.brand || p.Brand || p.cpuModel || '').trim();
        if (!this.filters.brands.includes(b)) return false;
      }
      if (this.filters.maxPrice != null && this.filters.maxPrice > 0) {
        if (this.getPrice(p) > this.filters.maxPrice) return false;
      }
      return true;
    });
    this.cdr.detectChanges();
  }

  getActiveFilterCount() {
    return this.filters.cores.length + this.filters.ram.length + this.filters.brands.length + (this.filters.maxPrice ? 1 : 0);
  }

  resetFilters() {
    this.filters = { cores: [], ram: [], brands: [], maxPrice: null };
    this.filtered = [...this.products];
    this.cdr.detectChanges();
  }

  toggleFilterSidebar() {
    this.filterSidebarOpen = !this.filterSidebarOpen;
    document.body.style.overflow = this.filterSidebarOpen ? 'hidden' : '';
  }

  closeFilterSidebar() {
    this.filterSidebarOpen = false;
    document.body.style.overflow = '';
  }

  private getPrice(p: any): number {
    return parseFloat(p.price || p.Price || '99999') || 99999;
  }

  private isIntel(p: any): boolean {
    const n = `${p.brand || p.cpuModel || ''}`.toLowerCase();
    return n.includes('intel') || n.includes('xeon') || /e[3-7]/.test(n);
  }

  private isAmd(p: any): boolean {
    const n = `${p.brand || p.cpuModel || ''}`.toLowerCase();
    return n.includes('amd') || n.includes('epyc') || n.includes('ryzen');
  }

  private getCheapestIntel(): any {
    return this.products.filter(p => this.isIntel(p) && this.getPrice(p) < 99999)
      .sort((a,b) => this.getPrice(a) - this.getPrice(b))[0] || null;
  }

  private getCheapestAmd(): any {
    return this.products.filter(p => this.isAmd(p) && this.getPrice(p) < 99999)
      .sort((a,b) => this.getPrice(a) - this.getPrice(b))[0] || null;
  }

  private getBestValuePerCore(): any {
    return this.products
      .filter(p => {
        const price = this.getPrice(p);
        const cores = parseInt(p.cores || p.Cores || '0') || 0;
        return price < 99999 && cores > 0;
      })
      .map(p => ({
        server: p,
        ppc: this.getPrice(p) / (parseInt(p.cores || p.Cores || '1') || 1)
      }))
      .sort((a,b) => a.ppc - b.ppc)[0]?.server || null;
  }

getTopThreeDedicated(): any[] {
  const result: { server: any; type: 'intel' | 'amd' | 'value' | 'fallback' }[] = [];

  const intel = this.getCheapestIntel();
  const amd   = this.getCheapestAmd();
  const value = this.getBestValuePerCore();

  if (intel) result.push({ server: intel, type: 'intel' });
  if (amd)   result.push({ server: amd,   type: 'amd' });
  if (value && !result.some(r => r.server.id === value.id)) {
    result.push({ server: value, type: 'value' });
  }

  // Fill up to 3 with cheapest available servers (fallback)
  const seenIds = new Set(result.map(r => r.server.id));
  const remaining = this.products
    .filter(p => !seenIds.has(p.id) && this.getPrice(p) < 99999)
    .sort((a, b) => this.getPrice(a) - this.getPrice(b));

  while (result.length < 3 && remaining.length > 0) {
    const next = remaining.shift()!;
    result.push({ server: next, type: 'fallback' });
    seenIds.add(next.id);
  }

  return result.slice(0, 3);
}

  trackByFn = (i: number, item: any) => item?.server?.id || i;

  orderNow(id: number) {
    this.http.get(API_ENDPOINTS.DEDICATED.ORDER_WHATSAPP(id.toString()), { responseType: 'text' as 'json' })
      .subscribe({
        next: (res: any) => {
          const link = typeof res === 'string' ? res : (res?.link || res?.url || '');
          window.open(link || `https://wa.me/+201063194547?text=I'm interested in Dedicated Server #${id}`, '_blank');
        },
        error: () => window.open(`https://wa.me/+201063194547?text=I'm interested in Dedicated Server #${id}`, '_blank')
      });
  }
}
