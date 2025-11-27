import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dedicated',
  standalone: true,
  imports: [CommonModule, RouterModule],   // <-- Important!
  templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class DedicatedComponent { }