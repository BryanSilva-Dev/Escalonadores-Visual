import { Routes } from '@angular/router';

export const routes: Routes = [

  { path: '', redirectTo: 'escalonador-novo', pathMatch: 'full' },

  {
    path: 'escalonador-novo',
    loadComponent: () =>
      import('./escalonador/pages/escalonador-novo/escalonador-novo')
        .then(c => c.EscalonadorNovo)
  },

  {
    path: 'historico',
    loadComponent: () =>
      import('./historico/pages/historico-visualizacao/historico-visualizacao')
        .then(c => c.HistoricoVisualizacao)
  },

  { path: '**', redirectTo: 'escalonador-novo' }
];