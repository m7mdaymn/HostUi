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
  private translate = inject(TranslateService);

  isScrolled = false;
  mobileMenuOpen = false;
  currentLang = 'en';
  currentUrl = '/home';

  constructor() {
    this.currentLang = this.translate.current;
    this.translate.lang.subscribe(l => this.currentLang = l);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.currentUrl = e.urlAfterRedirects;
        this.mobileMenuOpen = false;
      });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleLang() {
    const next = this.currentLang === 'en' ? 'ar' : 'en';
    this.translate.setLang(next as any);
  }

  text(key: string) {
    return this.translate.t(key);
  }
}
