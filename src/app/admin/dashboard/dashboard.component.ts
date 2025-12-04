import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

import { UsersService } from '../../core/services/users.service';
import { VpsService } from '../../core/services/vps.service';
import { DedicatedService } from '../../core/services/dedicated.service';
import { PackagesService } from '../../core/services/packages.service';
import { PromosService } from '../../core/services/promos.service';
import { OrdersService, OrderResponse } from '../../core/services/orders.service';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { AdminSidebarComponent } from "../shared/admin-sidebar/admin-sidebar.component";
import { AdminTopbarComponent } from "../shared/admin-topbar/admin-topbar.component";

type ChartView = 'week' | 'weeks' | 'months';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('orderChart', { static: false }) orderChartRef?: ElementRef<HTMLCanvasElement>;

  loading = false;
  stats: any = {};
  recentUsers: any[] = [];
  private chart: Chart | null = null;
  currentView: ChartView = 'week';

  constructor(
    private http: HttpClient,
    private router: Router,
    private usersService: UsersService,
    private vpsService: VpsService,
    private dedicatedService: DedicatedService,
    private packagesService: PackagesService,
    private promosService: PromosService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadOrderData();

    setTimeout(() => {
      if (this.recentUsers.length === 0) {
        this.loadRecentUsers();
      }
    }, 1000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeChart(), 100);
  }

  private initializeChart(): void {
    if (!this.orderChartRef?.nativeElement) return;
    this.updateChartView(this.currentView);
  }

  switchView(view: ChartView): void {
    this.currentView = view;
    this.updateChartView(view);
  }

  private updateChartView(view: ChartView): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.ordersService.getAllOrders().subscribe({
      next: (orders: OrderResponse[]) => {
        let config: ChartConfiguration;

        if (view === 'week') {
          config = this.createWeekDayChart(orders);
        } else if (view === 'weeks') {
          config = this.createWeeksChart(orders);
        } else {
          config = this.createMonthsChart(orders);
        }

        if (this.orderChartRef?.nativeElement) {
          this.chart = new Chart(this.orderChartRef.nativeElement, config);
        }
      },
      error: () => { /* error logged removed */ }
    });
  }

  private createWeekDayChart(orders: OrderResponse[]): ChartConfiguration {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Array(7).fill(0);

    orders.forEach(order => {
      const day = new Date(order.createdAt).getDay();
      dayCounts[day]++;
    });

    return {
      type: 'bar',
      data: {
        labels: dayNames,
        datasets: [{
          label: 'Orders by Day of Week',
          data: dayCounts,
          backgroundColor: [
            '#ef4444', '#f59e0b', '#eab308', '#22c55e',
            '#3b82f6', '#8b5cf6', '#ec4899'
          ],
          borderRadius: 8,
          hoverBackgroundColor: '#1e40af'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Orders Distribution - Days of the Week',
            font: { size: 18, weight: 'bold' },
            color: '#1e293b'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} orders`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    };
  }

  private createWeeksChart(orders: OrderResponse[]): ChartConfiguration {
    const now = new Date();
    const weekLabels: string[] = [];
    const weekCounts: number[] = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= weekStart && orderDate <= weekEnd;
      }).length;

      const label = i === 0 ? 'This Week' :
                    i === 1 ? 'Last Week' :
                    `${i} Weeks Ago`;

      weekLabels.push(label);
      weekCounts.push(count);
    }

    return {
      type: 'line',
      data: {
        labels: weekLabels,
        datasets: [{
          label: 'Orders per Week',
          data: weekCounts,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Orders Trend - Last 4 Weeks',
            font: { size: 18, weight: 'bold' },
            color: '#1e293b'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} orders`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    };
  }

  private createMonthsChart(orders: OrderResponse[]): ChartConfiguration {
    const now = new Date();
    const monthLabels: string[] = [];
    const monthCounts: number[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const count = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      }).length;

      const label = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
      monthLabels.push(label);
      monthCounts.push(count);
    }

    return {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Orders per Month',
          data: monthCounts,
          backgroundColor: '#8b5cf6',
          borderRadius: 10,
          hoverBackgroundColor: '#7c3aed'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Orders Volume - Last 6 Months',
            font: { size: 18, weight: 'bold' },
            color: '#1e293b'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} orders`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    };
  }

  getTotalOrders(): number {
    return 0;
  }

  loadOrderData(): void {
    this.ordersService.getAllOrders().subscribe({
      next: () => {},
      error: () => { /* error logged removed */ }
    });
  }

  loadStats(): void {
    this.http.get(API_ENDPOINTS.DASHBOARD.STATS).subscribe({
      next: (res: any) => {
        this.stats = res || {};

        if (this.stats.recentUsers && Array.isArray(this.stats.recentUsers) && this.stats.recentUsers.length > 0) {
          this.recentUsers = this.stats.recentUsers.slice(0, 5);
        } else {
          this.loadRecentUsers();
        }

        this.ensureCounts();
      },
      error: () => {
        this.ensureCounts();
        this.loadRecentUsers();
      }
    });
  }

  private ensureCounts() {
    const services = [
      { service: this.vpsService, key: 'totalVps' },
      { service: this.dedicatedService, key: 'totalDedicated' },
      { service: this.packagesService, key: 'totalPackages' },
      { service: this.promosService, key: 'totalPromos' }
    ];

    services.forEach(s => {
      if (this.stats[s.key] === undefined) {
        s.service.list().subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res?.data || []);
            this.stats[s.key] = list.length;
          },
          error: () => { /* error logged removed */ }
        });
      }
    });
  }

  loadRecentUsers(): void {
    this.usersService.list().subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res?.users && Array.isArray(res.users)) {
          list = res.users;
        } else {
          list = [];
        }

        this.recentUsers = list
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.CreatedAt || a.created_at || a.created || 0).getTime();
            const dateB = new Date(b.createdAt || b.CreatedAt || b.created_at || b.created || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);
      },
      error: () => {
        this.recentUsers = [];
      }
    });
  }

  onRefresh(): void {
    this.loadStats();
    this.updateChartView(this.currentView);
  }

  goTo(section: string): void {
    const routes: any = {
      users: '/admin/users',
      vps: '/admin/vps',
      dedicated: '/admin/dedicated',
      packages: '/admin/packages',
      promos: '/admin/promos'
    };
    this.router.navigate([routes[section.toLowerCase()] || '/admin/dashboard']);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
