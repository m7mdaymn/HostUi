import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({ providedIn: 'root' })
export class PackagesService {
  constructor(private http: HttpClient) {}

  list(): Observable<any> { return this.http.get(API_ENDPOINTS.PACKAGES.LIST); }
  get(id: string | number): Observable<any> { return this.http.get(API_ENDPOINTS.PACKAGES.SINGLE(id.toString())); }
  create(payload: any): Observable<any> { return this.http.post(API_ENDPOINTS.PACKAGES.CREATE, payload); }
  update(id: string | number, payload: any): Observable<any> { return this.http.put(API_ENDPOINTS.PACKAGES.UPDATE(id.toString()), payload); }
  delete(id: string | number): Observable<any> { return this.http.delete(API_ENDPOINTS.PACKAGES.DELETE(id.toString())); }
}
