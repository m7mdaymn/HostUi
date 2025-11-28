import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private router = inject(Router);
  currentUrl = '/home';
  isScrolled = false;
  currentLang = 'en';

  private translate = inject(TranslateService);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });
    this.currentLang = this.translate.current;
    this.translate.lang.subscribe(l => this.currentLang = l);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  isActive(path: string): boolean {
    return this.currentUrl === path || this.currentUrl.startsWith(path);
  }

  toggleLang() {
    const next = this.currentLang === 'en' ? 'ar' : 'en';
    this.translate.setLang(next as any);
  }

  text(key: string) { return this.translate.t(key); }
}
