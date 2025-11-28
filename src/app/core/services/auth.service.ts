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
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
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
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      map((response: AuthResponse): AuthResponse => {
        console.log('🔑 Login response:', response);
        // Map backend role string to frontend role type
        const backendRole = response.user.role.toLowerCase();
        let role: 'admin' | 'customer' | 'moderator' = 'customer';

        if (backendRole === 'admin') {
          role = 'admin';
        } else if (backendRole === 'moderator') {
          role = 'moderator';
        } else {
          role = 'customer';
        }

        // Create frontend User object
        const user: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: role
        };

        // Store token and user
        this.setAuthToken(response.token);
        this.setUser(user);

        console.log('✅ Login successful:', { user, hasToken: !!response.token });
        return response;
      }),
      tap((response: AuthResponse) => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          this.currentUserSubject.next(currentUser);
        }
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
    return !!this.getCurrentUser() && !!this.getAuthToken();
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

  isModerator(): boolean {
    return this.getCurrentUserRole() === 'moderator';
  }

  updateUserRole(user: User, role: 'admin' | 'customer' | 'moderator'): void {
    const updatedUser: User = { ...user, role };
    this.setUser(updatedUser);
    console.log('🔄 User role updated:', updatedUser.role);
  }

  hasValidSession(): boolean {
    const user = this.getStoredUser();
    const token = this.getAuthToken();
    return !!user && !!user.name && !!user.email && !!token;
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
        errorMessage = 'Invalid email or password';
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

  // For HTTP interceptors - get token for API requests
  getToken(): string | null {
    return this.getAuthToken();
  }

  setTestUser(email: string, name: string = 'Test User', role: 'admin' | 'customer' | 'moderator' = 'customer'): void {
    const testUser: User = {
      id: 1,
      name,
      email,
      role,
      phoneNumber: '+1234567890'
    };
    this.setUser(testUser);
    this.setAuthToken('test-jwt-token');
    console.log('🧪 Test user set:', testUser);
  }

  clearTestData(): void {
    this.clearStorage();
    console.log('🧪 Test data cleared');
  }
}
