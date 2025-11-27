import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    console.log('HomeComponent ngAfterViewInit — initializing banner');
    try {
      const $ = (window as any).$;
      const banner = document.querySelector('.banner__section');
      console.log('banner element present?', !!banner);
      const hasOwl = !!($ && $.fn && $.fn.owlCarousel);
      console.log('jQuery present?', !!$, 'owlCarousel present?', hasOwl);
      const initOwl = () => {
        try {
          ($('.banner__section') as any).owlCarousel({
            items: 1,
            loop: true,
            nav: true,
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true
          });
          console.log('Owl carousel initialized');
        } catch (err) {
          console.error('Error during owl initialization:', err);
        }
      };

      if (hasOwl) {
        initOwl();
        return;
      }

      // If owl isn't available yet, try loading it dynamically and then initialize.
      const scriptSrc = '/assets/js/owl.min.js';
      console.log('Attempting to load', scriptSrc);
      const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.includes('owl.min.js'));
      if (existing) {
        existing.addEventListener('load', () => {
          console.log('Found existing owl script — loaded');
          initOwl();
        });
      } else {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.onload = () => {
          console.log('Dynamically loaded owl.min.js');
          initOwl();
        };
        // Initialize Bootstrap tabs manually if Bootstrap is present.
        try {
          const bs = (window as any).bootstrap;
          if (bs && bs.Tab) {
            document.querySelectorAll('[data-bs-toggle="tab"]').forEach((btn) => {
              btn.addEventListener('click', (ev) => {
                ev.preventDefault();
                try {
                  const instance = bs.Tab.getOrCreateInstance(btn);
                  instance.show();
                } catch (e) {
                  console.error('Error showing bootstrap tab instance:', e);
                }
              });
            });
            console.log('Bootstrap tabs initialized manually');
          } else {
            console.warn('Bootstrap Tab API not available on window.bootstrap');
          }
        } catch (err) {
          console.error('Error initializing bootstrap tabs:', err);
        }
        script.onerror = (e) => {
          console.error('Failed to load owl.min.js', e);
          // Fallback: remove owl classes so content is visible
          const el = document.querySelectorAll('.banner__section');
          el.forEach((node) => node.classList.remove('owl-theme', 'owl-carousel'));
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      console.error('Error initializing banner carousel:', err);
    }
  }
}