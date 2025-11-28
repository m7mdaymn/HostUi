// auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constant/apiendpoints';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id?: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'customer' | 'moderator';
}

export interface AuthResponse {
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  private readonly USER_KEY = 'currentUser';
  private readonly TOKEN_KEY = 'authToken';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  register(userData: any): Observable<string | AuthResponse> {
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER, userData).pipe(
      tap((response: any) => {
        console.log('✅ Register success:', response);
      }),
      catchError(this.handleError('Registration failed'))
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      map((response: any): AuthResponse => {
        console.log('🔑 Raw login response:', response);

        const nameMatch = response.message?.match(/Welcome (.+)!/);
        const name = nameMatch ? nameMatch[1].trim() : 'User';

        const user: User = {
          name,
          email: credentials.email,
          role: 'customer',
          phoneNumber: ''
        };

        this.setUser(user);

        console.log('✅ Login user created:', user);
        return { message: response.message || 'Login successful', user };
      }),
      tap((response: AuthResponse) => {
        this.updateUserRole(response.user!);
      }),
      catchError(this.handleError('Login failed'))
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.clear();
    }
    this.currentUserSubject.next(null);
    console.log('👋 User logged out');
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'admin';
  }

  updateUserRole(user: User, role: 'admin' | 'customer' = 'customer'): void {
    const updatedUser: User = { ...user, role };
    this.setUser(updatedUser);
    console.log('🔄 User role updated:', updatedUser.role);
  }

  hasValidSession(): boolean {
    const user = this.getStoredUser();
    return !!user && !!user.name && !!user.email;
  }

  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (userJson) {
        try {
          return JSON.parse(userJson) as User;
        } catch (e) {
          console.error('❌ Invalid user data in localStorage:', e);
          this.clearStorage();
        }
      }
    }
    return null;
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUserSubject.next(null);
  }

  private handleError(operation: string) {
    return (error: any) => {
      console.error(`❌ ${operation} Error:`, error);

      let errorMessage = 'An unexpected error occurred';

      if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request data';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        error: error.error
      }));
    };
  }

  setAuthToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  setTestUser(email: string, name: string = 'Test User', role: 'admin' | 'customer' = 'customer'): void {
    const testUser: User = {
      name,
      email,
      role,
      phoneNumber: '+1234567890'
    };
    this.setUser(testUser);
    console.log('🧪 Test user set:', testUser);
  }

  clearTestData(): void {
    this.clearStorage();
    console.log('🧪 Test data cleared');
  }
}
