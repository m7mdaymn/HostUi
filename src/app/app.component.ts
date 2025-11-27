import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { FloatingWidgetComponent } from './shared/floating-widget/floating-widget.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet , RouterModule, CommonModule, HttpClientModule, HeaderComponent, FooterComponent , FloatingWidgetComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HostUi';
}
