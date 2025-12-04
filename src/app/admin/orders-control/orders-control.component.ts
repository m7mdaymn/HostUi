import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OrdersService, OrderResponse, CreateOrderDto } from '../../core/services/orders.service';
import { VpsService } from '../../core/services/vps.service';
import { DedicatedService } from '../../core/services/dedicated.service';
import { AdminSidebarComponent } from "../shared/admin-sidebar/admin-sidebar.component";
import { AdminTopbarComponent } from "../shared/admin-topbar/admin-topbar.component";

interface Product {
  id: number;
  name: string;
  cores?: number;
  ramGB?: number;
  storageGB?: number;
  storageType?: string;
  price: number;
  cpuName?: string;
  bandwidth?: string;
  storage?: string;
}

interface FullOrderResponse extends OrderResponse {
  vps?: Product;
  dedicated?: Product;
}

type ProductType = 'vps' | 'dedicated' | null;
type PaymentMethod = 'instapay' | 'vodafonecash' | 'binance' | '';

@Component({
  selector: 'app-orders-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './orders-control.component.html',
  styleUrl: './orders-control.component.css'
})
export class OrdersControlComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  orderForm: FormGroup;
  orders: OrderResponse[] = [];
  selectedOrder: FullOrderResponse | null = null;
  isLoadingDetails = false;

  message = '';
  error = '';
  isLoading = false;
  loadingProducts = true;
  showCreateForm = false;

  vpsList: Product[] = [];
  dedicatedList: Product[] = [];

  // Product type selection
  selectedProductType: ProductType = null;

  // Payment methods
  paymentMethods = [
    { value: 'instapay', label: 'InstaPay', icon: 'fa-credit-card' },
    { value: 'vodafonecash', label: 'Vodafone Cash', icon: 'fa-mobile-alt' },
    { value: 'binance', label: 'Binance', icon: 'fa-bitcoin' }
  ];

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private vpsService: VpsService,
    private dedicatedService: DedicatedService
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{10,20}$/)]],
      paymentMethod: ['', Validators.required],
      productType: ['', Validators.required],
      selectedVps: [{ value: null, disabled: true }],
      selectedDedicated: [{ value: null, disabled: true }],
      paymentImage: [null]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
    this.setupProductTypeListener();
  }

  setupProductTypeListener(): void {
    this.orderForm.get('productType')?.valueChanges.subscribe((type: ProductType) => {
      this.selectedProductType = type;

      const vpsControl = this.orderForm.get('selectedVps');
      const dedicatedControl = this.orderForm.get('selectedDedicated');

      if (type === 'vps') {
        vpsControl?.enable();
        vpsControl?.setValidators(Validators.required);
        dedicatedControl?.disable();
        dedicatedControl?.clearValidators();
        dedicatedControl?.setValue(null);
      } else if (type === 'dedicated') {
        dedicatedControl?.enable();
        dedicatedControl?.setValidators(Validators.required);
        vpsControl?.disable();
        vpsControl?.clearValidators();
        vpsControl?.setValue(null);
      } else {
        vpsControl?.disable();
        dedicatedControl?.disable();
        vpsControl?.clearValidators();
        dedicatedControl?.clearValidators();
      }

      vpsControl?.updateValueAndValidity();
      dedicatedControl?.updateValueAndValidity();
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;

    this.vpsService.productsList().subscribe({
      next: (res: any) => this.vpsList = this.extractArray(res),
      error: () => this.error = 'Failed to load VPS plans'
    });

    this.dedicatedService.productsList().subscribe({
      next: (res: any) => {
        this.dedicatedList = this.extractArray(res);
      },
      error: () => this.error = 'Failed to load Dedicated servers',
      complete: () => this.loadingProducts = false
    });
  }

  private extractArray(response: any): Product[] {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.Data && Array.isArray(response.Data)) return response.Data;
    if (response?.result && Array.isArray(response.result)) return response.result;
    return [];
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.orderForm.patchValue({ paymentImage: input.files[0] });
    }
  }

  createOrder(): void {
    if (this.orderForm.invalid) {
      this.error = 'Please fill all required fields correctly.';
      this.orderForm.markAllAsTouched();
      return;
    }

    const v = this.orderForm.value;

    this.isLoading = true;
    this.error = '';
    this.message = '';

    const orderData: CreateOrderDto = {
      customerName: v.customerName.trim(),
      phoneNumber: v.phoneNumber.trim(),
      paymentMethod: v.paymentMethod,
      vpsId: v.selectedVps ? Number(v.selectedVps) : null,
      dedicatedId: v.selectedDedicated ? Number(v.selectedDedicated) : null,
      paymentImage: v.paymentImage || null
    };

    this.ordersService.createOrder(orderData).subscribe({
      next: (res) => {
        this.message = `Order #${res.orderId || res.id} created successfully!`;
        this.resetForm();
        this.loadOrders();
        this.isLoading = false;
        setTimeout(() => this.message = '', 8000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create order.';
        this.isLoading = false;
      }
    });
  }

  loadOrders(): void {
    this.ordersService.getAllOrders().subscribe({
      next: (data) => this.orders = data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      error: () => this.error = 'Failed to load orders.'
    });
  }

  viewOrder(order: OrderResponse): void {
    this.isLoadingDetails = true;
    this.selectedOrder = null;

    this.ordersService.getOrderById(order.id).subscribe({
      next: (fullOrder: FullOrderResponse) => {
        this.selectedOrder = fullOrder;
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load order details';
        this.isLoadingDetails = false;
      }
    });
  }

  closeDetails(): void {
    this.selectedOrder = null;
    this.isLoadingDetails = false;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.orderForm.reset();
    this.selectedProductType = null;
    this.error = '';
    this.message = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getPaymentMethodLabel(method: string): string {
    const found = this.paymentMethods.find(m => m.value === method.toLowerCase());
    return found ? found.label : method;
  }

  getPaymentMethodIcon(method: string): string {
    const found = this.paymentMethods.find(m => m.value === method.toLowerCase());
    return found ? found.icon : 'fa-wallet';
  }

  getProductName(order: OrderResponse): string {
    return order.vpsId ? 'VPS Plan' : order.dedicatedId ? 'Dedicated Server' : 'No Product';
  }

  getProductBadgeClass(order: OrderResponse): string {
    return order.vpsId ? 'badge-vps' : order.dedicatedId ? 'badge-dedicated' : 'badge-empty';
  }
}
