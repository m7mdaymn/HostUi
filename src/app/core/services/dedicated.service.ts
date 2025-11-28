import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({ providedIn: 'root' })
export class DedicatedService {
  constructor(private http: HttpClient) {}

  list(): Observable<any> {
    return this.http.get(API_ENDPOINTS.DEDICATED.LIST);
  }

  get(id: string | number): Observable<any> {
    return this.http.get(API_ENDPOINTS.DEDICATED.SINGLE(id.toString()));
  }

  create(payload: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.DEDICATED.CREATE, payload);
  }

  update(id: string | number, payload: any): Observable<any> {
    return this.http.put(API_ENDPOINTS.DEDICATED.UPDATE(id.toString()), payload);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.DEDICATED.DELETE(id.toString()));
  }

  productsList(): Observable<any> {
    return this.http.get(API_ENDPOINTS.DEDICATED.PRODUCTS_LIST);
  }

  orderWhatsapp(id: string | number): Observable<any> {
    return this.http.get(API_ENDPOINTS.DEDICATED.ORDER_WHATSAPP(id.toString()));
  }
}
