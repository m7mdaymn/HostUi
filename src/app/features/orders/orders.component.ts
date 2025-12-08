import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../../core/services/translate.service';
import { OrdersService } from '../../core/services/orders.service';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { Subscription } from 'rxjs';

interface Product {
  [key: string]: any;
  id: number;
  name: string;
  price: number;
  cores?: number;
  ramGB?: number;
  storageGB?: number;
  storageType?: string;
  storage?: string;
  brand?: string;
  cpuModel?: string;
  connectionSpeed?: string;
  uplink?: string;
  bandwidth?: string;
  ip?: number;
  ips?: number;
  location?: string;
  datacenter?: string;
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
  instanttext = '';
  readonly USD_TO_EGP_RATE = 49.5;
  orderForm: FormGroup;
  private langSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private translate: TranslateService,
    private ordersService: OrdersService
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      paymentMethod: ['', Validators.required],
      OS: ['linux', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.instanttext = this.t('instantActivation');

    this.langSub = this.translate.lang.subscribe(() => {
      this.orderForm.markAsUntouched();
      this.instanttext = this.t('instantActivation');
    });

    const idStr = this.route.snapshot.queryParamMap.get('id');
    const typeStr = this.route.snapshot.queryParamMap.get('type');

    if (!idStr || !typeStr || !['vps', 'dedicated'].includes(typeStr)) {
      this.error = this.t('invalidProduct');
      this.loading = false;
      return;
    }

    const id = Number(idStr);
    this.loadProduct(id, typeStr as 'vps' | 'dedicated');
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  t(key: string): string {
    return this.translate.t(key);
  }

  private loadProduct(id: number, type: 'vps' | 'dedicated'): void {
    const endpoint = type === 'vps' ? API_ENDPOINTS.VPS.PRODUCTS_LIST : API_ENDPOINTS.DEDICATED.PRODUCTS_LIST;

    this.http.get<any>(endpoint).subscribe({
      next: (response) => {
        const products = Array.isArray(response) ? response : response.data || response.items || [];
        this.product = products.find((p: any) => p.id === id) || null;
        this.loading = false;
      },
      error: () => {
        this.error = this.t('loadFailed');
        this.loading = false;
      }
    });
  }

  displayStorage(): string {
    if (!this.product) return '—';
    if (this.product.storage) return this.product.storage;
    const gb = this.product.storageGB ?? 0;
    const type = (this.product.storageType || 'NVMe').toUpperCase();
    return `${gb} GB ${type}`;
  }

  getExtraSpecs(): string[] {
    if (!this.product) return [];

    const neverShow = [
      'id','name','price','cores','ramGB','storageGB','storageType','storage',
      'brand','cpuModel','connectionSpeed','uplink','bandwidth','ip','ips',
      'location','datacenter','discount','limited','isActive','active','status',
      'stock','inStock','createdAt','updatedAt','__priceNum','__v','_id',
      'order','available','soldOut','is_available'
    ];

    return Object.keys(this.product)
      .filter(k => !neverShow.includes(k) && this.product![k] != null && this.product![k] !== '' && typeof this.product![k] !== 'object')
      .filter(k => String(this.product![k]).trim().length <= 100)
      .sort();
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]?.type.startsWith('image/')) {
      this.selectedFile = input.files[0];
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  null;
  }

  submitOrder(): void {
    if (this.orderForm.invalid || !this.product || this.submitting) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const type = this.route.snapshot.queryParamMap.get('type');

    const orderData: any = {
      customerName: this.orderForm.get('customerName')?.value.trim(),
      phoneNumber: this.orderForm.get('phoneNumber')?.value,
      paymentMethod: this.orderForm.get('paymentMethod')?.value,
      OS: this.orderForm.get('OS')?.value,
      notes: this.orderForm.get('notes')?.value?.trim() || undefined,
      paymentImage: this.selectedFile || undefined,
      ...(type === 'vps' ? { vpsId: this.product.id, dedicatedId: null } : {}),
      ...(type === 'dedicated' ? { dedicatedId: this.product.id, vpsId: null } : {})
    };

    this.ordersService.createOrder(orderData).subscribe({
      next: (res) => {
        this.successMessage = this.t('orderSuccess').replace('{id}', res.orderId.toString());
        this.orderForm.reset();
        this.orderForm.patchValue({ OS: 'linux' });
        this.selectedFile = null;
        this.submitting = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ أثناء إرسال الطلب';
        this.submitting = false;
      }
    });
  }
getEgpAmount(): number {
  if (!this.product?.price) return 0;
  return this.product.price * this.USD_TO_EGP_RATE;
}
  goBack(): void {
    window.history.back();
  }
}
