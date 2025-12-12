import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-trading-ai-vps',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './trading-ai-vps.component.html',
  styleUrls: ['./trading-ai-vps.component.css']
})
export class TradingAiVpsComponent implements OnInit {
  private translate = inject(TranslateService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  currentLang = 'en';
  canonicalUrl = '';
  articleTitle = '';
  articleDescription = '';
  featuredImage = '/assets/img/articles/best-vps/main.webp';

  ngOnInit(): void {
    this.currentLang = this.translate.current;
    this.updateSeoTags();

    if (isPlatformBrowser(this.platformId)) {
      this.translate.lang.subscribe(() => this.updateSeoTags());
    }
  }

  private updateSeoTags(): void {
    const isArabic = this.currentLang === 'ar';
    const baseUrl = 'https://www.toprdps.com';
    const langPrefix = isArabic ? '/ar' : '';
    this.canonicalUrl = `${baseUrl}${langPrefix}/best-vps-trading-ai`;

    this.articleTitle = isArabic
      ? 'أفضل VPS للـ Trading Bots والـ AI في 2026 (دليل شامل + مقارنة أسعار وأداء)'
      : 'Best VPS for Forex Trading, Crypto Bots & AI in 2026 (Complete Guide + Comparison)';

    this.articleDescription = isArabic
      ? 'أقوى 8 مزودي VPS لتشغيل بوتات التداول ونماذج الذكاء الاصطناعي في 2026 مع مقارنة أداء وسعر ولاتنسي – محدث ديسمبر 2025'
      : 'Top 8 VPS providers for running trading bots and AI models in 2026 with performance, price, and latency comparison – Updated Dec 2025';

    this.titleService.setTitle(`${this.articleTitle} | TopRDP`);

    this.meta.updateTag({ name: 'description', content: this.articleDescription });
    this.meta.updateTag({ name: 'keywords', content: isArabic
      ? 'أفضل VPS للتريدنج 2026, VPS للبوتات, VPS للذكاء الاصطناعي, best VPS for trading bots, VPS AI hosting, low latency forex VPS'
      : 'best vps for trading 2026, vps for forex bots, vps for ai, low latency trading vps, best vps for mt4 mt5' });

    this.meta.updateTag({ property: 'og:title', content: this.articleTitle });
    this.meta.updateTag({ property: 'og:description', content: this.articleDescription });
    this.meta.updateTag({ property: 'og:url', content: this.canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: baseUrl + this.featuredImage });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:locale', content: isArabic ? 'ar_EG' : 'en_US' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: this.articleTitle });
    this.meta.updateTag({ name: 'twitter:description', content: this.articleDescription });
    this.meta.updateTag({ name: 'twitter:image', content: baseUrl + this.featuredImage });

    this.document.querySelectorAll('[data-seo="true"]').forEach(el => el.remove());

    const canonical = this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = this.canonicalUrl;
    canonical.setAttribute('data-seo', 'true');
    this.document.head.appendChild(canonical);

    const enLink = this.document.createElement('link');
    enLink.rel = 'alternate';
    enLink.hreflang = 'en';
    enLink.href = `${baseUrl}/best-vps-trading-ai`;
    enLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(enLink);

    const arLink = this.document.createElement('link');
    arLink.rel = 'alternate';
    arLink.hreflang = 'ar';
    arLink.href = `${baseUrl}/ar/best-vps-trading-ai`;
    arLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(arLink);
  }

  text(key: string): string {
    return this.translate.t(key);
  }
}
