import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-beginner-guide',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './beginner-guide.component.html',
  styleUrls: ['./beginner-guide.component.css']
})
export class BeginnerGuideComponent implements OnInit {
  private translate = inject(TranslateService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  currentLang = 'en';
  canonicalUrl = '';
  articleTitle = '';
  articleDescription = '';
  featuredImage = '/assets/img/articles/beginners-guide/main.webp';

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
    this.canonicalUrl = `${baseUrl}${langPrefix}/beginners-guide`;

    this.articleTitle = isArabic
      ? 'دليل المبتدئين: كيف تشتري أول VPS في حياتك بدون ما تتضحك عليك (دليل شامل 2026)'
      : "Beginner's Guide: How to Buy Your First VPS Without Getting Scammed (2026)";

    this.articleDescription = isArabic
      ? 'الدليل الأكثر شمولاً في الوطن العربي لشراء VPS آمن بدون نصب، مع مقارنات حقيقية ونصائح للمصممين والمطورين – محدث ديسمبر 2025'
      : 'The most comprehensive guide in the Arab world for buying a secure VPS without fraud – Updated December 2025';

    // Title
    this.titleService.setTitle(`${this.articleTitle} | TopRDP`);

    // Meta Tags
    this.meta.updateTag({ name: 'description', content: this.articleDescription });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'keywords', content: isArabic
      ? 'دليل VPS للمبتدئين, شراء VPS بدون نصب, VPS مصر, VPS للمصممين, أفضل VPS 2026, كيف تشتري VPS'
      : 'VPS beginner guide, buy VPS no scam, Egypt VPS, VPS for designers, best VPS 2026' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: this.articleTitle });
    this.meta.updateTag({ property: 'og:description', content: this.articleDescription });
    this.meta.updateTag({ property: 'og:url', content: this.canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: baseUrl + this.featuredImage });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:locale', content: isArabic ? 'ar_EG' : 'en_US' });
    this.meta.updateTag({ property: 'og:site_name', content: 'TopRDP' });

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: this.articleTitle });
    this.meta.updateTag({ name: 'twitter:description', content: this.articleDescription });
    this.meta.updateTag({ name: 'twitter:image', content: baseUrl + this.featuredImage });

    // Remove old SEO elements
    this.document.querySelectorAll('[data-seo="true"]').forEach(el => el.remove());

    // Canonical
    const canonical = this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = this.canonicalUrl;
    canonical.setAttribute('data-seo', 'true');
    this.document.head.appendChild(canonical);

    // hreflang
    const enLink = this.document.createElement('link');
    enLink.rel = 'alternate';
    enLink.hreflang = 'en';
    enLink.href = `${baseUrl}/beginners-guide`;
    enLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(enLink);

    const arLink = this.document.createElement('link');
    arLink.rel = 'alternate';
    arLink.hreflang = 'ar';
    arLink.href = `${baseUrl}/ar/beginners-guide`;
    arLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(arLink);

    const xDefault = this.document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${baseUrl}/beginners-guide`;
    xDefault.setAttribute('data-seo', 'true');
    this.document.head.appendChild(xDefault);
  }

  text(key: string): string {
    return this.translate.t(key);
  }
}
