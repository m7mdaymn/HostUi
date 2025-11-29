// src/app/core/services/users.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constant/apiendpoints';
export interface User {
  id?: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  isBlocked: boolean;
  createdAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let msg = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      msg = error.error.message;
    } else {
      msg = error.error?.message || error.message || msg;
    }
    return throwError(() => new Error(msg));
  }

  list(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.USERS.LIST).pipe(catchError(this.handleError));
  }

  get(id: string | number): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USERS.SINGLE(id)).pipe(catchError(this.handleError));
  }

  create(payload: any): Observable<User> {
    return this.http.post<User>(API_ENDPOINTS.USERS.CREATE, payload).pipe(catchError(this.handleError));
  }

  update(id: string | number, payload: any): Observable<User> {
    return this.http.put<User>(API_ENDPOINTS.USERS.UPDATE(id), payload).pipe(catchError(this.handleError));
  }

  delete(id: string | number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.USERS.DELETE(id)).pipe(catchError(this.handleError));
  }
}
