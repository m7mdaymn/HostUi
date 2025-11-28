import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  list(): Observable<any> {
    return this.http.get(API_ENDPOINTS.USERS.LIST);
  }

  get(id: string | number): Observable<any> {
    return this.http.get(API_ENDPOINTS.USERS.SINGLE(id.toString()));
  }

  create(payload: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.USERS.CREATE, payload);
  }

  update(id: string | number, payload: any): Observable<any> {
    return this.http.put(API_ENDPOINTS.USERS.UPDATE(id.toString()), payload);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.USERS.DELETE(id.toString()));
  }
}
