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
  cpuModel?: string;
  connectionSpeed?: string;
  storage?: string;
  bandwidth?: string;
}

interface FullOrderResponse extends OrderResponse {
  vps?: Product;
  dedicated?: Product;
}
type ProductType = 'vps' | 'dedicated' | null;

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

  selectedProductType: ProductType = null;

  paymentMethods = [
    { value: 'vodafone_cash', label: 'Vodafone Cash', icon: 'fa-mobile-alt' },
    { value: 'instapay', label: 'InstaPay', icon: 'fa-credit-card' },
    { value: 'binance', label: 'Binance Pay', icon: 'fa-bitcoin' }
  ];

  operatingSystems = [
    { value: 'linux', label: 'Linux', icon: 'fab fa-linux' },
    { value: 'windows', label: 'Windows', icon: 'fab fa-windows' }
  ];

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private vpsService: VpsService,
    private dedicatedService: DedicatedService
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      paymentMethod: ['', Validators.required],
      OS: ['linux', Validators.required],
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
      const vpsCtrl = this.orderForm.get('selectedVps');
      const dedCtrl = this.orderForm.get('selectedDedicated');

      if (type === 'vps') {
        vpsCtrl?.enable();
        vpsCtrl?.setValidators(Validators.required);
        dedCtrl?.disable();
        dedCtrl?.clearValidators();
        dedCtrl?.setValue(null);
      } else if (type === 'dedicated') {
        dedCtrl?.enable();
        dedCtrl?.setValidators(Validators.required);
        vpsCtrl?.disable();
        vpsCtrl?.clearValidators();
        vpsCtrl?.setValue(null);
      } else {
        vpsCtrl?.disable();
        dedCtrl?.disable();
        vpsCtrl?.clearValidators();
        dedCtrl?.clearValidators();
      }
      vpsCtrl?.updateValueAndValidity();
      dedCtrl?.updateValueAndValidity();
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;

    this.vpsService.productsList().subscribe({
      next: (res: any) => this.vpsList = this.extractArray(res),
      error: () => this.error = 'Failed to load VPS plans'
    });

    this.dedicatedService.productsList().subscribe({
      next: (res: any) => this.dedicatedList = this.extractArray(res),
      error: () => this.error = 'Failed to load Dedicated servers',
      complete: () => this.loadingProducts = false
    });
  }

  private extractArray(response: any): Product[] {
    if (Array.isArray(response)) return response;
    if (response?.data) return response.data;
    if (response?.result) return response.result;
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
      this.error = 'Please fill all required fields.';
      this.orderForm.markAllAsTouched();
      return;
    }

    const v = this.orderForm.value;
    this.isLoading = true;
    this.error = '';
    this.message = '';

    let selectedProduct: Product | undefined;
    let productTypeLabel = '';

    if (v.productType === 'vps' && v.selectedVps) {
      selectedProduct = this.vpsList.find(p => p.id === Number(v.selectedVps));
      productTypeLabel = 'VPS Plan';
    } else if (v.productType === 'dedicated' && v.selectedDedicated) {
      selectedProduct = this.dedicatedList.find(p => p.id === Number(v.selectedDedicated));
      productTypeLabel = 'Dedicated Server';
    }

    let description = `New Hosting Order\n`;
    description += `${'='.repeat(50)}\n\n`;
    description += `Customer: ${v.customerName.trim()}\n`;
    description += `Phone: ${v.phoneNumber.trim()}\n`;
    description += `OS: ${v.OS === 'linux' ? 'Linux' : 'Windows'}\n`;
    description += `Payment Method: ${this.getPaymentMethodLabel(v.paymentMethod)}\n\n`;

    if (selectedProduct) {
      const isVps = v.productType === 'vps';
      description += `${isVps ? 'VPS Plan' : 'Dedicated Server'}: ${selectedProduct.name}\n`;
      description += `${'-'.repeat(40)}\n`;

      if (isVps) {
        description += `CPU Cores: ${selectedProduct.cores} vCPU\n`;
      } else {
        const cpuText = selectedProduct.cpuModel || `${selectedProduct.cores || '?'} Core Dedicated CPU`;
        description += `CPU: ${cpuText}\n`;
      }

      description += `RAM: ${selectedProduct.ramGB} GB\n`;

      if (selectedProduct.storageGB != null) {
        const type = selectedProduct.storageType ? ` ${selectedProduct.storageType}` : ' NVMe';
        description += `Storage: ${selectedProduct.storageGB} GB${type}\n`;
      }
      if (selectedProduct.storage) {
        description += `Storage: ${selectedProduct.storage}\n`;
      }

      description += `Price: $${selectedProduct.price}/month\n`;

      if (selectedProduct.connectionSpeed) {
        description += `Connection: ${selectedProduct.connectionSpeed}\n`;
      } else if (isVps) {
        description += `Connection: 1 Gbps Shared\n`;
      }
    } else {
      description += `Warning: Product not found in local list!\n`;
    }

    description += `\nOrder created on: ${new Date().toLocaleString('en-GB')}`;

    const orderData: any = {
      customerName: v.customerName.trim(),
      phoneNumber: v.phoneNumber.trim(),
      paymentMethod: v.paymentMethod,
      OS: v.OS,
      vpsId: v.selectedVps ? Number(v.selectedVps) : null,
      dedicatedId: v.selectedDedicated ? Number(v.selectedDedicated) : null,
      paymentImage: v.paymentImage || undefined,
      description: description.trim()
    };

    this.ordersService.createOrder(orderData).subscribe({
      next: (res) => {
        this.message = `Order #${res.orderId} created successfully!`;
        this.resetForm();
        this.showCreateForm = false;
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
      next: (data) => {
        this.orders = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: () => this.error = 'Failed to load orders.'
    });
  }

  viewOrder(order: OrderResponse): void {
    this.isLoadingDetails = true;
    this.selectedOrder = null;

    this.ordersService.getOrderById(order.id).subscribe({
      next: (fullOrder: any) => {
        this.selectedOrder = fullOrder;
        this.isLoadingDetails = false;
      },
      error: () => {
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
    if (!this.showCreateForm) this.resetForm();
  }

  private resetForm(): void {
    this.orderForm.reset({
      customerName: '',
      phoneNumber: '',
      OS: 'linux',
      paymentMethod: '',
      productType: '',
      selectedVps: null,
      selectedDedicated: null,
      paymentImage: null
    });
    this.selectedProductType = null;
    this.error = '';
    this.message = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getProductName(order: OrderResponse): string {
    if (order.vpsId && this.vpsList.length) {
      const vps = this.vpsList.find(v => v.id === order.vpsId);
      if (vps) {
        const cpu = vps.cpuModel ? vps.cpuModel : `${vps.cores} Cores`;
        return `${vps.name} (${cpu})`;
      }
    }
    if (order.dedicatedId && this.dedicatedList.length) {
      const ded = this.dedicatedList.find(d => d.id === order.dedicatedId);
      if (ded) {
        const cpu = ded.cpuModel ? ded.cpuModel : `${ded.cores || '?'} Cores`;
        return `${ded.name} (${cpu})`;
      }
    }
    return 'Unknown Product';
  }

  getProductBadgeClass(order: OrderResponse): string {
    return order.vpsId ? 'badge-vps' : order.dedicatedId ? 'badge-dedicated' : 'badge-empty';
  }

  getPaymentMethodLabel(method: string): string {
    const m = this.paymentMethods.find(x => x.value === method);
    return m ? m.label : method;
  }

  getPaymentMethodIcon(method: string): string {
    const m = this.paymentMethods.find(x => x.value === method);
    return m ? m.icon : 'fa-wallet';
  }
}
