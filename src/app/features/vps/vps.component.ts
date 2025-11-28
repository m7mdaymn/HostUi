import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { TranslateService } from '../../core/services/translate.service';

interface Filters {
  cores: string;
  ram: string;
  storage: string;
  maxPrice: number | null;
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

  // Applied filters (only updated on submit)
  filters: Filters = { cores: '', ram: '', storage: '', maxPrice: null };

  // Temporary filters (for preview in sidebar)
  tempFilters: Filters = { cores: '', ram: '', storage: '', maxPrice: null };

  filtered: any[] = [];
  filtersApplied = false;
  filterSidebarOpen = false;

  private translate = inject(TranslateService);

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
        this.loading = false;
      },
      error: (err) => {
        console.error('VPS load error', err);
        this.error = 'Unable to load VPS plans. Please try again later.';
        this.loading = false;
      }
    });
  }

  submitFilters(): void {
    if (this.getPreviewCount() === 0) return;

    this.filters = { ...this.tempFilters };
    this.applyFilters();
    this.filtersApplied = this.getActiveFilterCount() > 0;
    this.closeFilterSidebar();
  }

  resetTempFilters(): void {
    this.tempFilters = { cores: '', ram: '', storage: '', maxPrice: null };
  }

  resetFilters(): void {
    this.filters = { cores: '', ram: '', storage: '', maxPrice: null };
    this.tempFilters = { ...this.filters };
    this.filtered = [...this.products];
    this.filtersApplied = false;
    this.closeFilterSidebar();
  }

  applyFilters(): void {
    if (!this.filtersApplied) return;

    this.filtered = this.products.filter(p => {
      if (this.filters.cores) {
        const cores = p.cores || p.Cores || '';
        if (String(cores) !== String(this.filters.cores)) return false;
      }

      if (this.filters.ram) {
        const ram = p.ramGB || p.RamGB || p.RAM || '';
        if (String(ram) !== String(this.filters.ram)) return false;
      }

      if (this.filters.storage) {
        const st = (p.storageType || p.StorageType || '').toLowerCase();
        if (!st.includes(String(this.filters.storage).toLowerCase())) return false;
      }

      if (this.filters.maxPrice != null) {
        const price = parseFloat(p.price || p.Price || 0);
        if (isNaN(price) || price > this.filters.maxPrice!) return false;
      }

      return true;
    });
  }

  getPreviewCount(): number {
    return this.products.filter(p => {
      if (this.tempFilters.cores) {
        const cores = p.cores || p.Cores || '';
        if (String(cores) !== String(this.tempFilters.cores)) return false;
      }
      if (this.tempFilters.ram) {
        const ram = p.ramGB || p.RamGB || p.RAM || '';
        if (String(ram) !== String(this.tempFilters.ram)) return false;
      }
      if (this.tempFilters.storage) {
        const st = (p.storageType || p.StorageType || '').toLowerCase();
        if (!st.includes(String(this.tempFilters.storage).toLowerCase())) return false;
      }
      if (this.tempFilters.maxPrice != null) {
        const price = parseFloat(p.price || p.Price || 0);
        if (isNaN(price) || price > this.tempFilters.maxPrice!) return false;
      }
      return true;
    }).length;
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filters.cores) count++;
    if (this.filters.ram) count++;
    if (this.filters.storage) count++;
    if (this.filters.maxPrice != null && this.filters.maxPrice > 0) count++;
    return count;
  }

  getActiveTempFilterCount(): number {
    let count = 0;
    if (this.tempFilters.cores) count++;
    if (this.tempFilters.ram) count++;
    if (this.tempFilters.storage) count++;
    if (this.tempFilters.maxPrice != null && this.tempFilters.maxPrice > 0) count++;
    return count;
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
    if (this.filterSidebarOpen) {
      document.body.style.overflow = 'hidden';
      this.tempFilters = { ...this.filters };
    } else {
      document.body.style.overflow = '';
    }
  }

  closeFilterSidebar(): void {
    this.filterSidebarOpen = false;
    document.body.style.overflow = '';
  }

  getBestThree(): any[] {
    if (this.filtered.length < 3) return this.filtered;

    const scored = this.filtered.map(p => {
      const cores = parseInt(p.cores || p.Cores || '0');
      const ram = parseInt(p.ramGB || p.RamGB || '0');
      const storage = parseInt(p.storageGB || p.StorageGB || '0');
      const price = parseFloat(p.price || p.Price || '0');
      const storageType = (p.storageType || p.StorageType || '').toLowerCase();
      const storageBonus = storageType.includes('nvme') ? 2 : storageType.includes('ssd') ? 1 : 0;

      const specScore = (cores * 10) + (ram * 5) + (storage * 0.1) + (storageBonus * 20);
      const valueScore = price > 0 ? specScore / price : specScore;

      return { product: p, score: valueScore };
    });

    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3);

    if (top3.length === 3) {
      return [top3[1].product, top3[0].product, top3[2].product];
    }
    return top3.map(s => s.product);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
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
