import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Make jQuery available globally for legacy plugins that expect `window.$` / `window.jQuery`.
import * as jquery from 'jquery';
(window as any).$ = jquery;
(window as any).jQuery = jquery;

// Bootstrap JS (bundle includes Popper). Bootstrap 5 doesn't require jQuery, but some plugins do.
import 'bootstrap/dist/js/bootstrap.bundle.js';

// Re-enable only Owl Carousel script for the home banner carousel.
import './assets/js/owl.min.js';

// Global error handlers to help capture runtime issues that cause a white screen.
window.addEventListener('error', (event) => {
  // eslint-disable-next-line no-console
  console.error('Global error captured:', event.error || event.message, event.filename + ':' + event.lineno + ':' + event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', event.reason);
});

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Angular bootstrapped successfully'))
  .catch((err) => console.error('Angular bootstrap error:', err));

  