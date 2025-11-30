import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  whatsappLink = '';
  form = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  private translate = inject(TranslateService);

  text(key: string): string {
    return this.translate.t(key);
  }

  ngOnInit(): void {
    this.updateWhatsAppLink();

    this.translate.lang.subscribe(() => {
      this.updateWhatsAppLink();
    });
  }

  private updateWhatsAppLink(): void {
    const msg = this.translate.current === 'ar'
      ? 'مرحباً، أريد التواصل مع فريق الدعم'
      : "Hello, I'd like to get in touch with your support team";

    this.whatsappLink = `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  onSubmit(): void {
    const { name, email, phone, subject, message } = this.form;
    if (!name || !email || !message) return;

    const text = this.translate.current === 'ar'
      ? `الاسم: ${name}\nالبريد: ${email}\nالهاتف: ${phone}\nالموضوع: ${subject}\nالرسالة: ${message}`
      : `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\nMessage: ${message}`;

    const waLink = `https://wa.me/+201063194547?text=${encodeURIComponent(text)}`;
    window.open(waLink, '_blank');

    this.form = { name: '', email: '', phone: '', subject: '', message: '' };
  }
}
