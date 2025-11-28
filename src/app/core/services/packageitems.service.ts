import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({ providedIn: 'root' })
export class PackageItemsService {
  constructor(private http: HttpClient) {}

  list(): Observable<any> { return this.http.get(API_ENDPOINTS.PACKAGE_ITEMS.LIST); }
  create(payload: any): Observable<any> { return this.http.post(API_ENDPOINTS.PACKAGE_ITEMS.CREATE, payload); }
  update(id: string | number, payload: any): Observable<any> { return this.http.put(API_ENDPOINTS.PACKAGE_ITEMS.UPDATE(id.toString()), payload); }
  delete(id: string | number): Observable<any> { return this.http.delete(API_ENDPOINTS.PACKAGE_ITEMS.DELETE(id.toString())); }
}
