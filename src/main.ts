import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as jquery from 'jquery';


(window as any).$ = jquery;
(window as any).jQuery = jquery;

import 'bootstrap/dist/js/bootstrap.bundle.js';

// تعطيل الـ console كلياً في ng serve و production معاً
(window as any).console = {
  log: () => {},
  warn: () => {},
  error: () => {},
  info: () => {},
  debug: () => {},
  trace: () => {},
  table: () => {},
  group: () => {},
  groupEnd: () => {},
  clear: () => {},
  dir: () => {},
  time: () => {},
  timeEnd: () => {}
};

// إخفاء أي أخطاء عالمية عشان ما تظهرش في الـ console
window.addEventListener('error', () => {});
window.addEventListener('unhandledrejection', () => {});

bootstrapApplication(AppComponent, appConfig);
