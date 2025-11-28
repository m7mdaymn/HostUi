import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../../core/services/translate.service';
import { HttpClientModule } from '@angular/common/http';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';

interface Promo { id?: any; title?: string; description?: string; image?: string; link?: string }

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './promos.component.html',
  styleUrls: ['./promos.component.css']
})
export class PromosComponent implements OnInit {
  loading = false;
  error = '';
  promos: Promo[] = [];

  constructor(private http: HttpClient) {}

  private translate = inject(TranslateService);
  text(key: string) { return this.translate.t(key); }

  ngOnInit(): void {
    this.loadPromos();
  }

  loadPromos(): void {
    this.loading = true;
    this.http.get(API_ENDPOINTS.PROMOS.LIST).subscribe({ next: (res:any) => {
      this.promos = Array.isArray(res) ? res : (res.data || res || []);
      this.loading = false;
    }, error: e => { console.error(e); this.error = 'Unable to load promos'; this.loading = false; } });
  }

  getOrderLink(p: Promo): string {
    if (p && p.link) return p.link;
    const title = p?.title || 'promo';
    const text = encodeURIComponent(`Hello, I'm interested in your promo ${title}`);
    return `https://wa.me/?text=${text}`;
  }
}