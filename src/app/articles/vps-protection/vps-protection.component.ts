import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-vps-protection',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vps-protection.component.html',
  styleUrls: ['./vps-protection.component.css']
})
export class VpsProtectionComponent implements OnInit {
  private translate = inject(TranslateService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  currentLang = 'en';
  canonicalUrl = '';
  articleTitle = '';
  articleDescription = '';
  featuredImage = '/assets/img/articles/vps-protection/main.webp';

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
    this.canonicalUrl = `${baseUrl}${langPrefix}/vps-protection`;

    this.articleTitle = isArabic
      ? 'كيف تحمي VPS الخاص بك من الهجمات الـ DDoS والهاكرز (دليل خطوة بخطوة)'
      : 'How to Protect Your VPS from DDoS Attacks & Hackers (Step-by-Step Guide 2026)';

    this.articleDescription = isArabic
      ? 'الدليل الأقوى لحماية VPS من DDoS والهجمات في 2026 – 15 خطوة عملية مع أوامر + أدوات مجانية ومدفوعة + نصائح للمصممين'
      : 'Ultimate guide to protect your VPS from DDoS and hackers in 2026 – 15 practical steps with commands + free & paid tools + tips for designers';

    this.titleService.setTitle(`${this.articleTitle} | TopRDP`);

    this.meta.updateTag({ name: 'description', content: this.articleDescription });
    this.meta.updateTag({ name: 'keywords', content: isArabic
      ? 'حماية VPS من DDoS, كيف تحمي VPS من الهاكرز, دليل أمان VPS 2026, VPS security guide, حماية سيرفر افتراضي'
      : 'protect VPS from DDoS, VPS security 2026, how to secure VPS, VPS firewall setup, VPS protection guide' });

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
    enLink.href = `${baseUrl}/vps-protection`;
    enLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(enLink);

    const arLink = this.document.createElement('link');
    arLink.rel = 'alternate';
    arLink.hreflang = 'ar';
    arLink.href = `${baseUrl}/ar/vps-protection`;
    arLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(arLink);
  }

  text(key: string): string {
    return this.translate.t(key);
  }
}
