import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-escalonador-novo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './escalonador-novo.html',
  styleUrl: './escalonador-novo.css',
})
export class EscalonadorNovo implements OnInit {
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {

  }
}