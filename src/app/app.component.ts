import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FloatingWidgetComponent } from './shared/floating-widget/floating-widget.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { ToastComponent } from './shared/toast/toast.component';
import { TranslateService } from './core/services/translate.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterModule, CommonModule, HttpClientModule,
    HeaderComponent, FooterComponent, FloatingWidgetComponent, ToastComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isFirstLoad = true;
  showGlobalLayout = true;

  private authRoutes = ['/signin', '/signup'];
  private translate = inject(TranslateService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setupPreloader();
    this.setupLanguageFromUrl();
    this.setupLayoutVisibility();
  }

  private setupPreloader() {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isReload = navEntry?.type === 'reload';
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (!hasVisited || isReload) {
      sessionStorage.setItem('hasVisited', 'true');
      setTimeout(() => this.isFirstLoad = false, 2100);
    } else {
      this.isFirstLoad = false;
    }
  }

  // الجزء السحري: تحديد اللغة من الـ URL
  private setupLanguageFromUrl() {
    const path = window.location.pathname;
    const isArabic = path === '/ar' || path.startsWith('/ar/');

    const lang: 'ar' | 'en' = isArabic ? 'ar' : 'en';

    // 1. نحفظ اللغة في localStorage
    localStorage.setItem('lang', lang);

    // 2. نطبقها على الـ TranslateService
    this.translate.setLang(lang);

    // 3. نغير اتجاه و لغة الـ <html> فورًا
    this.renderer.setAttribute(this.document.documentElement, 'lang', lang);
    this.renderer.setAttribute(this.document.documentElement, 'dir', lang === 'ar' ? 'rtl' : 'ltr');

    // 4. ننظف الـ URL من /ar (بدون ريفريش)
    if (isArabic && path.startsWith('/ar')) {
      const cleanPath = path.replace(/^\/ar/, '') || '/home';
      history.replaceState(null, '', cleanPath);
    }
  }

  private setupLayoutVisibility() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      const url = e.urlAfterRedirects;

      const hideLayout =
        ['/signin', '/signup'].some(route =>
          url === route || url.startsWith(route + '?')
        ) ||
        url.includes('/admin');

      this.showGlobalLayout = !hideLayout;
    });
  }
}
