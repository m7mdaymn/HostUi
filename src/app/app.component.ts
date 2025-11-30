import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FloatingWidgetComponent } from './shared/floating-widget/floating-widget.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { ToastComponent } from './shared/toast/toast.component';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Preloader logic (unchanged)
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isReload = navEntry?.type === 'reload';
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (!hasVisited || isReload) {
      sessionStorage.setItem('hasVisited', 'true');
      setTimeout(() => {
        this.isFirstLoad = false;
      }, 2100);
    } else {
      this.isFirstLoad = false;
    }

    // Hide header & footer on signin/signup + admin routes
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      const url = e.urlAfterRedirects;

      this.showGlobalLayout = !(
        this.authRoutes.includes(url) ||           // Hide on /signin & /signup
        this.authRoutes.some(route => url.startsWith(route + '?')) || // Handle query params
        url.startsWith('/admin')                   // Keep hiding on admin
      );
    });
  }
}
