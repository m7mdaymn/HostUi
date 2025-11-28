import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> {
    const user = this.auth.getCurrentUser();
    const isAdmin = !!user && (user.role?.toString().toLowerCase() === 'admin');

    if (isAdmin) {
      return true;
    }

    // Redirect to sign in with optional returnUrl
    this.router.navigate(['/signin'], { queryParams: { returnUrl: '/admin/dashboard' } });
    return false;
  }
}
