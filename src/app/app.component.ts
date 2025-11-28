import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { FloatingWidgetComponent } from './shared/floating-widget/floating-widget.component';
import { ToastComponent } from './shared/toast/toast.component';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet , RouterModule, CommonModule, HttpClientModule, HeaderComponent, FooterComponent , FloatingWidgetComponent, ToastComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HostUi';
  showGlobalLayout = true;

  constructor(private router: Router) {
    // hide global header/footer for admin routes
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((ev: any) => {
      const url: string = ev.urlAfterRedirects || ev.url || '';
      this.showGlobalLayout = !url.startsWith('/admin');
    });
  }
}
