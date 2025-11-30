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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Show preloader only on first visit or hard refresh
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isReload = navEntry?.type === 'reload';
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (!hasVisited || isReload) {
      sessionStorage.setItem('hasVisited', 'true');

      setTimeout(() => {
        this.isFirstLoad = false;
      }, 2100);
    } else {
      this.isFirstLoad = false; // instant skip
    }

    // Your admin layout logic
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.showGlobalLayout = !e.urlAfterRedirects.startsWith('/admin');
      });
  }
}
