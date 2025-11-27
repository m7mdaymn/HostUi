import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  register(user: { name: string; email: string; password: string; phone: string; address: string; age: number; role?: string }): Observable<any> {
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER, user);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  // Convenience wrapper matching UI fields for Sign Up
  signUp(payload: { name: string; email: string; phone: string; password: string }): Observable<any> {
    // Map to backend register shape; adjust as backend expects
    return this.register({ name: payload.name, email: payload.email, password: payload.password, phone: payload.phone, address: '', age: 0 });
  }

  // Convenience wrapper matching UI fields for Sign In
  signIn(credentials: { email: string; password: string }): Observable<any> {
    return this.login(credentials);
  }
}