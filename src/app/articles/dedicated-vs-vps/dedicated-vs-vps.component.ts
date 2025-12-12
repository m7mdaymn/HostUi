import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dedicated-vs-vps',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dedicated-vs-vps.component.html',
  styleUrls: ['./dedicated-vs-vps.component.css']
})
export class DedicatedVsVpsComponent implements OnInit {
  private translate = inject(TranslateService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  currentLang = 'en';
  canonicalUrl = '';
  articleTitle = '';
  articleDescription = '';
  featuredImage = '/assets/img/articles/dedicated-vs-vps/main.webp';

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
    this.canonicalUrl = `${baseUrl}${langPrefix}/dedicated-vs-vps`;

    this.articleTitle = isArabic
      ? 'الفرق بين VPS و Dedicated Server: أيهم تختار ولماذا؟ (دليل شامل 2026)'
      : 'VPS vs Dedicated Server: Which to Choose in 2026? (Complete Guide)';

    this.articleDescription = isArabic
      ? 'مقارنة شاملة 2026 بين VPS و Dedicated Server من حيث السعر، الأداء، الأمان، التحكم، قابلية التوسع. جدول مقارنة + توصيات خبراء + أسئلة شائعة.'
      : 'Complete 2026 comparison between VPS and Dedicated Server: price, performance, security, control, scalability. Comparison table + expert recommendations + FAQ.';

    this.titleService.setTitle(`${this.articleTitle} | TopRDP`);

    this.meta.updateTag({ name: 'description', content: this.articleDescription });
    this.meta.updateTag({ name: 'keywords', content: isArabic
      ? 'VPS vs Dedicated, الفرق بين VPS و Dedicated, سيرفر مخصص, vps مصر, مقارنة VPS و Dedicated 2026'
      : 'VPS vs Dedicated Server, dedicated vs vps 2026, best server for website' });

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
    enLink.href = `${baseUrl}/dedicated-vs-vps`;
    enLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(enLink);

    const arLink = this.document.createElement('link');
    arLink.rel = 'alternate';
    arLink.hreflang = 'ar';
    arLink.href = `${baseUrl}/ar/dedicated-vs-vps`;
    arLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(arLink);
  }

  text(key: string): string {
    return this.translate.t(key);
  }
}
