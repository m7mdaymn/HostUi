import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as jquery from 'jquery';


(window as any).$ = jquery;
(window as any).jQuery = jquery;

import 'bootstrap/dist/js/bootstrap.bundle.js';



bootstrapApplication(AppComponent, appConfig);
