// src/app/core/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/apiendpoints';

export interface CreateOrderDto {
  customerName: string;
  phoneNumber: string;
  paymentMethod: string;
  vpsId?: number | null;
  dedicatedId?: number | null;
  paymentImage?: File | null;
  OS?: 'linux' | 'windows'; // This matches your backend exactly
}

export interface OrderResponse {
  id: number;
  customerName: string;
  phoneNumber: string;
  vpsId: number | null;
  dedicatedId: number | null;
  paymentMethod: string;
  paymentConfirmationImageUrl: string | null;
  description: string | null;
  createdAt: string;
  OS: string;
}

export interface CreateOrderResponse {
  message: string;
  orderId: number;
  description: string;
  imageUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderDto): Observable<CreateOrderResponse> {
    const formData = new FormData();

    formData.append('CustomerName', orderData.customerName);
    formData.append('PhoneNumber', orderData.phoneNumber);
    formData.append('PaymentMethod', orderData.paymentMethod);

    // Send IDs (can be empty string if not selected)
    formData.append('VpsId', orderData.vpsId?.toString() ?? '');
    formData.append('DedicatedId', orderData.dedicatedId?.toString() ?? '');

    if (orderData.OS) {
      formData.append('OS', orderData.OS); // CORRECT
    }

    // File must be named exactly "PaymentImage"
    if (orderData.paymentImage) {
      formData.append('PaymentImage', orderData.paymentImage, orderData.paymentImage.name);
    }

    return this.http.post<CreateOrderResponse>(API_ENDPOINTS.ORDERS.CREATE, formData);
  }

  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(API_ENDPOINTS.ORDERS.LIST);
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(API_ENDPOINTS.ORDERS.SINGLE(id));
  }
}
