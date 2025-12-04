import { Component, AfterViewInit } from '@angular/core';
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
export class HomeComponent implements AfterViewInit {

  constructor(private translate: TranslateService) {}

  text(key: string): string {
    return this.translate.t(key);
  }

  ngAfterViewInit(): void {
    // Small delay to ensure jQuery & Owl Carousel are fully loaded from angular.json scripts
    setTimeout(() => {
      const $ = (window as any).$;
      const $banner = $('.banner__section');

      if ($ && $.fn?.owlCarousel && $banner.length) {
        $banner.owlCarousel({
          items: 1,
          loop: true,
          nav: true,
          dots: true,
          autoplay: true,
          autoplayTimeout: 5000,
          autoplayHoverPause: true,
          navText: [
            '<i class="fas fa-chevron-left"></i>',
            '<i class="fas fa-chevron-right"></i>'
          ],
          responsive: {
            0: { items: 1 },
            768: { items: 1 },
            992: { items: 1 }
          }
        });
      }
    }, 100);
  }
}
