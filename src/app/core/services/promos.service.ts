import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({ providedIn: 'root' })
export class PromosService {
  constructor(private http: HttpClient) {}

  list(): Observable<any> { return this.http.get(API_ENDPOINTS.PROMOS.LIST); }
  get(id: string | number): Observable<any> { return this.http.get(API_ENDPOINTS.PROMOS.UPDATE(id.toString())); }
  create(payload: any): Observable<any> { return this.http.post(API_ENDPOINTS.PROMOS.CREATE, payload); }
  update(id: string | number, payload: any): Observable<any> { return this.http.put(API_ENDPOINTS.PROMOS.UPDATE(id.toString()), payload); }
  delete(id: string | number): Observable<any> { return this.http.delete(API_ENDPOINTS.PROMOS.DELETE(id.toString())); }
}
