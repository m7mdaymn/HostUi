// src/app/core/services/packageitems.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({
  providedIn: 'root'
})
export class PackageItemsService {
  constructor(private http: HttpClient) {}

  getItems(packageId: string): Observable<any> {
    return this.http.get(API_ENDPOINTS.PACKAGE_ITEMS.LIST, {
      params: { packageId }
    });
    // Calls: GET /api/PackageItems?packageId=14
  }

  addItem(payload: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.PACKAGE_ITEMS.CREATE, payload);
  }

  deleteItem(itemId: string | number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.PACKAGE_ITEMS.DELETE(itemId.toString()));
  }
}
