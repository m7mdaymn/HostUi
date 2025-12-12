import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-montage-guide',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './montage-guide.component.html',
  styleUrls: ['./montage-guide.component.css']
})
export class MontageGuideComponent implements OnInit {
  private translate = inject(TranslateService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  currentLang = 'en';
  canonicalUrl = '';
  articleTitle = '';
  articleDescription = '';
  featuredImage = '/assets/img/articles/montage-guide/main.webp';

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
    this.canonicalUrl = `${baseUrl}${langPrefix}/montage-guide`;

    this.articleTitle = isArabic
      ? 'ازاي تختار السيرفر بتاعك لو انت في مجال المونتاج والبث والاسكريبتات (دليل شامل 2026)'
      : 'How to Choose Your Server for Video Editing, Live Streaming & Scripting (Ultimate 2026 Guide)';

    this.articleDescription = isArabic
      ? 'الدليل الأقوى في 2026 لاختيار سيرفر للمونتاج، البث المباشر، الاسكريبتات، والمصممين. مقارنة VPS vs Dedicated vs Cloud + نصائح للكرييتورز في مصر والخليج'
      : 'The ultimate 2026 guide to choosing a server for video editing, live streaming, scripting, and designers. VPS vs Dedicated vs Cloud comparison + tips for creators in Egypt & Gulf';

    this.titleService.setTitle(`${this.articleTitle} | TopRDP`);

    this.meta.updateTag({ name: 'description', content: this.articleDescription });
    this.meta.updateTag({ name: 'keywords', content: isArabic
      ? 'سيرفر للمونتاج, سيرفر للبث المباشر, VPS للاسكريبتات, سيرفر للمصممين, أفضل سيرفر 2026, سيرفر للكرييتورز مصر'
      : 'server for video editing, server for live streaming, VPS for scripting, server for designers, best server 2026' });

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
    enLink.href = `${baseUrl}/montage-guide`;
    enLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(enLink);

    const arLink = this.document.createElement('link');
    arLink.rel = 'alternate';
    arLink.hreflang = 'ar';
    arLink.href = `${baseUrl}/ar/montage-guide`;
    arLink.setAttribute('data-seo', 'true');
    this.document.head.appendChild(arLink);
  }

  text(key: string): string {
    return this.translate.t(key);
  }
}
