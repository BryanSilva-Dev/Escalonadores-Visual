import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-historico-visualizacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico-visualizacao.html',
  styleUrl: './historico-visualizacao.css',
})
export class HistoricoVisualizacao implements OnInit {
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {

  }
}