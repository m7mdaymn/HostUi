import { Injectable } from '@angular/core';

// src/app/services/json-ld.service.ts
@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private script: HTMLScriptElement | null = null;

  setJsonLd(data: any) {
    this.removeJsonLd();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.script = document.head.appendChild(script);
  }

  removeJsonLd() {
    if (this.script) {
      document.head.removeChild(this.script);
      this.script = null;
    }
  }
}
