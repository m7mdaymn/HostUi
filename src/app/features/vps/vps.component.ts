import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-vps',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './vps.component.html',
  styleUrls: ['./vps.component.css']
})
export class VpsComponent implements OnInit {
  products: any[] = [];
  loading = false;
  error: string | null = null;
  filters = { cores: '', ram: '', storage: '', maxPrice: null as number | null };
  filtered: any[] = [];
  brands: string[] = [];

  private translate = inject(TranslateService);

  constructor(private http: HttpClient, private router: Router) {}

  text(key: string) { return this.translate.t(key); }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.http.get(API_ENDPOINTS.VPS.PRODUCTS_LIST).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : (res.data || res || []);
        this.brands = Array.from(new Set(this.products.map((p:any) => (p.brand || p.Brand || '').toString().trim()).filter((b:string)=>!!b)));
        this.filtered = [...this.products];
        this.loading = false;
      },
      error: (err) => { console.error('VPS load error', err); this.error = 'Unable to load VPS plans'; this.loading = false; }
    });
  }

  applyFilters() {
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

  resetFilters() { this.filters = { cores: '', ram: '', storage: '', maxPrice: null }; this.applyFilters(); }

  orderNow(id: number) {
    // call whatsapp API endpoint and open returned link
    this.http.get(API_ENDPOINTS.VPS.ORDER_WHATSAPP(id.toString()), { responseType: 'text' as 'json' }).subscribe({
      next: (res: any) => {
        const link = (typeof res === 'string') ? res : (res?.link || res?.url);
        if (link) window.open(link as string, '_blank');
      },
      error: (err) => {
        console.error('Order link error', err);
        // fallback to a generic WhatsApp link
        const text = encodeURIComponent('Hello, I\'m interested in VPS plan id ' + id);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    });
  }
}