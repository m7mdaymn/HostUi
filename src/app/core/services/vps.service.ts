import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({ providedIn: 'root' })
export class VpsService {
  constructor(private http: HttpClient) {}

  list(): Observable<any> {
    return this.http.get(API_ENDPOINTS.VPS.LIST);
  }

  get(id: string | number): Observable<any> {
    return this.http.get(API_ENDPOINTS.VPS.SINGLE(id.toString()));
  }

  create(payload: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.VPS.CREATE, payload);
  }

  update(id: string | number, payload: any): Observable<any> {
    return this.http.put(API_ENDPOINTS.VPS.UPDATE(id.toString()), payload);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.VPS.DELETE(id.toString()));
  }

  // public products endpoints
  productsList(): Observable<any> {
    return this.http.get(API_ENDPOINTS.VPS.PRODUCTS_LIST);
  }

  orderWhatsapp(id: string | number): Observable<any> {
    return this.http.get(API_ENDPOINTS.VPS.ORDER_WHATSAPP(id.toString()));
  }
}
