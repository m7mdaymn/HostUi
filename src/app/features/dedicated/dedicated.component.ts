import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dedicated',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dedicated.component.html',
  styleUrls: ['./dedicated.component.css']
})
export class DedicatedComponent { }