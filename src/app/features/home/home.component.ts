import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslateService } from '../../core/services/translate.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VpsCarouselComponent } from "../../shared/vps-carousel/vps-carousel.component";
import { DedicatedCarouselComponent } from "../../shared/dedicated-carousel/dedicated-carousel.component";
import { CtaSectionComponent } from "../../shared/cta-section/cta-section.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VpsCarouselComponent,
    DedicatedCarouselComponent,
    CtaSectionComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isHomePage = true;
  private routerSubscription!: Subscription;

  constructor(
    private translate: TranslateService,
    private router: Router
  ) {
    // Detect current route to show/hide preview cards
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.isHomePage = url === '/' || url === '/home' || url.startsWith('/?') || url === '';
      });
  }

  text(key: string): string {
    return this.translate.t(key);
  }

  ngAfterViewInit(): void {
    // Initialize Owl Carousel if needed (your banner)
    setTimeout(() => {
      const $ = (window as any).$;
      if ($ && $.fn?.owlCarousel) {
        $('.banner__section').owlCarousel({
          items: 1,
          loop: true,
          nav: true,
          dots: true,
          autoplay: true,
          autoplayTimeout: 5000,
          navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>']
        });
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
