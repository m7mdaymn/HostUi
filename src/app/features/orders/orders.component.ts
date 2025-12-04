// src/app/features/orders/orders.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../../core/services/translate.service';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { Subscription } from 'rxjs';

interface Product {
  id: number;
  name: string;
  cores?: number;
  ramGB?: number;
  storageGB?: number;
  storageType?: string;
  price: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = true;
  error = '';
  selectedFile: File | null = null;
  submitting = false;
  successMessage = '';

  orderForm: FormGroup;
  private langSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private translate: TranslateService // ← Translation service injected
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-]?[0-9]{8}$/)]],
      paymentMethod: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Re-render when language changes
    this.langSub = this.translate.lang.subscribe(() => {
      this.orderForm.markAsUntouched();
    });

    const idStr = this.route.snapshot.queryParamMap.get('id');
    const typeStr = this.route.snapshot.queryParamMap.get('type');

    if (!idStr || !typeStr || !['vps', 'dedicated'].includes(typeStr)) {
      this.error = this.t('invalidProduct');
      this.loading = false;
      return;
    }

    const id = Number(idStr);
    const type = typeStr as 'vps' | 'dedicated';

    this.loadProduct(id, type);
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  // Translation helper
  t(key: string): string {
    return this.translate.t(key);
  }

  private loadProduct(id: number, type: 'vps' | 'dedicated'): void {
    const endpoint =
      type === 'vps'
        ? API_ENDPOINTS.VPS.PRODUCTS_LIST
        : API_ENDPOINTS.DEDICATED.PRODUCTS_LIST;

    this.http.get<any>(endpoint).subscribe({
      next: (response) => {
        const products = Array.isArray(response)
          ? response
          : (response as any).data || (response as any).items || [];

        this.product = products.find((p: any) => p.id === id) || null;

        if (!this.product) {
          this.error = this.t('productNotFound');
        }
        this.loading = false;
      },
      error: () => {
        this.error = this.t('loadFailed');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0] && input.files[0].type.startsWith('image/')) {
      this.selectedFile = input.files[0];
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  submitOrder(): void {
    if (this.orderForm.invalid || !this.product || this.submitting) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('customerName', this.orderForm.get('customerName')?.value.trim());
    formData.append('phoneNumber', this.orderForm.get('phoneNumber')?.value);
    formData.append('paymentMethod', this.orderForm.get('paymentMethod')?.value);
    formData.append('notes', this.orderForm.get('notes')?.value || '');

    if (this.product.id < 1000) {
      formData.append('vpsId', this.product.id.toString());
    } else {
      formData.append('dedicatedId', this.product.id.toString());
    }

    if (this.selectedFile) {
      formData.append('paymentImage', this.selectedFile);
    }

    this.http.post(API_ENDPOINTS.ORDERS.CREATE, formData).subscribe({
      next: (res: any) => {
        const orderId = res.orderId || res.id || '';
        this.successMessage = this.t('orderSuccess').replace('{id}', orderId || '—');
        this.orderForm.reset();
        this.selectedFile = null;
        this.submitting = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || this.t('orderFailed');
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}
