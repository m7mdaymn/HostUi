import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslateService } from '../../core/services/translate.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Services
  private router = inject(Router);
  private translate = inject(TranslateService);
  public authService = inject(AuthService);

  // State
  isScrolled = false;
  mobileMenuOpen = false;
  currentLang = 'en';
  activeSubmenu: string | null = null;
  isMobile = false;

  currentUser: User | null = null;
  isLoggedIn = false;

  private authSub!: Subscription;
  private closeTimer: any;

  constructor() {
    this.currentLang = this.translate.current;
    this.translate.lang.subscribe(l => this.currentLang = l);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.closeMobileMenu());
  }

  ngOnInit() {
    this.checkIfMobile();

    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkIfMobile();
    if (!this.isMobile) this.closeMobileMenu();
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth <= 991;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.activeSubmenu = null;
    this.preventBodyScroll();
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.activeSubmenu = null;
    this.allowBodyScroll();
  }

  toggleSubmenu(submenu: string, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.mobileMenuOpen) {
      this.activeSubmenu = this.activeSubmenu === submenu ? null : submenu;
    }
  }

  // عند دخول الماوس على العنصر
  onMenuItemEnter(submenu: string) {
    if (this.mobileMenuOpen) return;
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.activeSubmenu = submenu;
  }

  // عند خروج الماوس من العنصر
  onMenuItemLeave() {
    if (this.mobileMenuOpen) return;
    this.closeTimer = setTimeout(() => {
      this.activeSubmenu = null;
    }, 100); // تأخير قصير جداً بس كافي
  }

  toggleLang(event: Event) {
    event.stopPropagation();
    const next = this.currentLang === 'en' ? 'ar' : 'en';
    this.translate.setLang(next as 'en' | 'ar');
  }

  text(key: string): string {
    return this.translate.t(key);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  private preventBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  private allowBodyScroll() {
    document.body.style.overflow = 'auto';
  }
}
