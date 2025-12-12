import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { Meta, Title } from '@angular/platform-browser';

interface ArticleData {
  id: string;
  routePath: string;
  image: string;
  categoryKey: string;
  titleKey: string;
  excerptKey: string;
  readTimeKey: string;
  altKey: string;
}

@Component({
  selector: 'app-home-articles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-articles.component.html',
  styleUrls: ['./home-articles.component.css']
})
export class HomeArticlesComponent implements OnInit {

  articles: ArticleData[] = [
    {
      id: 'beginners-guide',
      routePath: '/beginners-guide',
      image: '/assets/img/articles/beginners-guide/main.webp',
      categoryKey: 'article_category_comprehensive',
      titleKey: 'article_title_beginners_guide',
      excerptKey: 'article_excerpt_beginners_guide',
      readTimeKey: 'article_read_time_45',
      altKey: 'article_alt_beginners_guide'
    },
    {
      id: 'vps-protection',
      routePath: '/vps-protection',
      image: '/assets/img/articles/vps-protection/main.webp',
      categoryKey: 'article_category_security',
      titleKey: 'article_title_vps_protection',
      excerptKey: 'article_excerpt_vps_protection',
      readTimeKey: 'article_read_time_50',
      altKey: 'article_alt_vps_protection'
    },
    {
      id: 'dedicated-vs-vps',
      routePath: '/dedicated-vs-vps',
      image: '/assets/img/articles/dedicated-vs-vps/main.webp',
      categoryKey: 'article_category_comparisons',
      titleKey: 'article_title_dedicated_vs_vps',
      excerptKey: 'article_excerpt_dedicated_vs_vps',
      readTimeKey: 'article_read_time_15',
      altKey: 'article_alt_dedicated_vs_vps'
    },
    {
      id: 'montage-guide',
      routePath: '/montage-guide',
      image: '/assets/img/articles/montage-guide/main.webp',
      categoryKey: 'article_category_creators',
      titleKey: 'article_title_montage_guide',
      excerptKey: 'article_excerpt_montage_guide',
      readTimeKey: 'article_read_time_50',
      altKey: 'article_alt_montage_guide'
    },
    {
      id: 'best-stores',
      routePath: '/best-stores',
      image: '/assets/img/articles/best-store/main.webp',
      categoryKey: 'article_category_comparisons_2026',
      titleKey: 'article_title_best_stores',
      excerptKey: 'article_excerpt_best_stores',
      readTimeKey: 'article_read_time_40',
      altKey: 'article_alt_best_stores'
    },
    {
      id: 'best-vps-trading-ai',
      routePath: '/best-vps-trading-ai',
      image: '/assets/img/articles/best-vps/main.webp',
      categoryKey: 'article_category_trading_ai',
      titleKey: 'article_title_best_vps_trading_ai',
      excerptKey: 'article_excerpt_best_vps_trading_ai',
      readTimeKey: 'article_read_time_55',
      altKey: 'article_alt_best_vps_trading_ai'
    }
  ];

  private translate = inject(TranslateService);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  text(key: string): string {
    return this.translate.t(key);
  }

  ngOnInit(): void {
    this.updateSeoTags();

    if (isPlatformBrowser(this.platformId)) {
      this.translate.lang.subscribe(() => this.updateSeoTags());
    }
  }

  private updateSeoTags(): void {
    const currentLang = this.translate.current;
    const isArabic = currentLang === 'ar';
    const baseUrl = 'https://www.toprdps.com';

    const langPrefix = isArabic ? '/ar' : '';
    const canonicalUrl = `${baseUrl}${langPrefix}/articles`;
    const ogImage = `${baseUrl}/assets/img/logo/newlogo.png`;

    this.title.setTitle('TopRDP Articles - Best Guides for VPS, RDP, Trading & More');

    this.meta.updateTag({
      name: 'description',
      content: 'Discover the best articles about RDP, VPS servers, trading bots, protection guides, and server comparisons. Updated 2025 guides in English and Arabic.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'RDP articles, VPS guides, best RDP 2025, trading VPS, server protection, dedicated vs VPS, TopRDP blog'
    });

    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: 'TopRDP Articles - Best RDP & VPS Guides 2025' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Latest expert articles on RDP, VPS, trading servers, security, and performance from TopRDP.'
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:locale', content: isArabic ? 'ar_EG' : 'en_US' });
    this.meta.updateTag({ property: 'og:site_name', content: 'TopRDP' });

    // ==================== Twitter Cards ====================
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'TopRDP Articles - Best VPS & RDP Guides 2025' });
    this.meta.updateTag({
      name: 'twitter:description',
      content: 'Expert guides on RDP, VPS, trading servers, security & performance. Updated 2025.'
    });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    this.document.querySelectorAll('[data-seo="true"]').forEach((el: Element) => el.remove());

    const canonical = this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalUrl;
    canonical.setAttribute('data-seo', 'true');
    this.document.head.appendChild(canonical);

    const enUrl = `${baseUrl}/articles`;
    const arUrl = `${baseUrl}/ar/articles`;

    const hreflangs = [
      { hreflang: 'x-default', href: enUrl },
      { hreflang: 'en', href: enUrl },
      { hreflang: 'ar', href: arUrl }
    ];

    hreflangs.forEach(item => {
      const link = this.document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = item.hreflang;
      link.href = item.href;
      link.setAttribute('data-seo', 'true');
      this.document.head.appendChild(link);
    });

    // ==================== Schema.org (مع روابط صحيحة حسب اللغة) ====================
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "TopRDP Articles - Best RDP & VPS Guides 2025",
      "description": "Collection of expert articles about RDP, VPS servers, trading bots, server security, performance optimization and comparisons.",
      "url": canonicalUrl,
      "inLanguage": isArabic ? "ar" : "en",
      "publisher": {
        "@type": "Organization",
        "name": "TopRDP",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/assets/img/logo/newlogo.png`
        }
      },
      "areaServed": [
        "DZ","BH","KM","DJ","EG","IQ","JO","KW","LB","LY","MR","MA","OM","PS","QA","SA","SO","SD","SY","TN","AE","YE",
        "AL","AD","AT","BY","BE","BA","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IE","IT",
        "XK","LV","LI","LT","LU","MT","MD","MC","ME","NL","MK","NO","PL","PT","RO","RU","SM","RS","SK",
        "SI","ES","SE","CH","UA","GB","VA"
      ],
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": this.articles.length,
        "itemListElement": this.articles.map((article, i) => {
          const staticData: Record<string, { headline: string; description: string }> = {
            'beginners-guide': {
              headline: "Beginner's Guide to RDP & VPS Servers 2025",
              description: "Complete beginner-friendly guide to understanding RDP, VPS, dedicated servers, and how to choose the best hosting solution for your needs."
            },
            'vps-protection': {
              headline: "How to Secure Your VPS Server from Attacks in 2025",
              description: "Advanced security guide to protect your VPS from DDoS, brute force, malware, and hacking attempts. Updated protection methods for 2025."
            },
            'dedicated-vs-vps': {
              headline: "Dedicated Server vs VPS: Which is Better in 2025?",
              description: "Detailed comparison between dedicated servers and VPS hosting – performance, cost, scalability, and best use cases explained."
            },
            'montage-guide': {
              headline: "Best Montage & Video Editing VPS/RDP Setup Guide 2025",
              description: "Ultimate guide for content creators: Best RDP/VPS specs for Adobe Premiere, After Effects, DaVinci Resolve, and smooth 4K editing."
            },
            'best-stores': {
              headline: "Best RDP & VPS Providers 2025 – Top 10 Ranked",
              description: "Honest ranking of the best RDP and VPS providers in 2025 based on speed, uptime, support, and pricing. Updated list with real tests."
            },
            'best-vps-trading-ai': {
              headline: "Best VPS for Forex Trading, Crypto Bots & AI in 2025",
              description: "Top low-latency VPS servers for MT4, MT5, TradingView, crypto trading bots, and AI algorithms. Locations near exchanges included."
            }
          };

          const data = staticData[article.id] || {
            headline: "TopRDP Expert Article 2025",
            description: "Professional guide and tutorial about RDP, VPS, trading, and server management."
          };

          return {
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "Article",
              "headline": data.headline,
              "description": data.description,
              "image": baseUrl + article.image,
              "url": `${baseUrl}${langPrefix}${article.routePath}`,
              "datePublished": "2025-01-01",
              "dateModified": "2025-06-01",
              "author": { "@type": "Organization", "name": "TopRDP" },
              "publisher": { "@type": "Organization", "name": "TopRDP" }
            }
          };
        })
      }
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema, null, 2);
    script.setAttribute('data-seo', 'true');
    this.document.head.appendChild(script);
  }

  trackByArticle(index: number, article: ArticleData): string {
    return article.id;
  }
}
