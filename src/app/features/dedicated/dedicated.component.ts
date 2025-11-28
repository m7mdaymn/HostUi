import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-dedicated',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './dedicated.component.html',
  styleUrls: ['./dedicated.component.css'],
  
})
export class DedicatedComponent implements OnInit {
  products: any[] = [];
  loading = false;
  error: string | null = null;
  // filters
  filters = { cores: '', ram: '', brand: '', maxPrice: null as number | null };
  filtered: any[] = [];
  brands: string[] = [];

  

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
      if (this.filters.brand) {
        const b = (p.brand || p.Brand || '').toLowerCase();
        if (!b.includes(String(this.filters.brand).toLowerCase())) return false;
      }
      if (this.filters.maxPrice != null) {
        const price = parseFloat(p.price || p.Price || 0);
        if (isNaN(price) || price > this.filters.maxPrice!) return false;
      }
      return true;
    });
  }

  constructor(private http: HttpClient, private translate: TranslateService) {}

  text(key: string) { return this.translate.t(key); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.http.get(API_ENDPOINTS.DEDICATED.PRODUCTS_LIST).subscribe({ next: (res:any) => {
      this.products = Array.isArray(res) ? res : (res.data || res || []);
      this.brands = Array.from(new Set(this.products.map((p:any) => (p.brand || p.Brand || '').toString().trim()).filter((b:string)=>!!b)));
      this.filtered = [...this.products];
      this.loading = false;
    }, error: e => { console.error(e); this.error='Unable to load products'; this.loading=false; } });
  }

  resetFilters() { this.filters = { cores: '', ram: '', brand: '', maxPrice: null }; this.applyFilters(); }

  orderNow(id: number) {
    this.http.get(API_ENDPOINTS.DEDICATED.ORDER_WHATSAPP(id.toString()), { responseType: 'text' as 'json' }).subscribe({ next: (res:any) => { const link = (typeof res === 'string') ? res : (res?.link || res?.url); if (link) window.open(link as string, '_blank'); }, error: e => { console.error(e); const text = encodeURIComponent('Hello, I\'m interested in dedicated server id ' + id); window.open(`https://wa.me/?text=${text}`, '_blank'); } });
  }
}