import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage { id: number; text: string; type?: 'success'|'error'|'info'; duration?: number }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 1;
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  show(text: string, type: 'success'|'error'|'info' = 'info', duration = 4000) {
    const msg: ToastMessage = { id: this.counter++, text, type, duration };
    const list = [msg, ...this.messagesSubject.value];
    this.messagesSubject.next(list);
    setTimeout(() => this.remove(msg.id), duration + 200);
    return msg.id;
  }

  remove(id: number) {
    const list = this.messagesSubject.value.filter(m => m.id !== id);
    this.messagesSubject.next(list);
  }
}
