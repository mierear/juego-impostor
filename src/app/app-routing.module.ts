import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'lobby/:id',
    loadChildren: () => import('./pages/lobby/lobby.module').then(m => m.LobbyModule)
  },
  {
    path: 'game/:id',
    loadChildren: () => import('./pages/game/game.module').then(m => m.GameModule)
  },
  {
    path: 'clues/:id',
    loadChildren: () => import('./pages/clues/clues.module').then(m => m.CluesModule)
  },
  {
    path: 'voting/:id',
    loadChildren: () => import('./pages/voting/voting.module').then(m => m.VotingModule)
  },
  {
    path: 'game-over/:id',
    loadComponent: () => import('./pages/game-over/game-over.component').then(m => m.GameOverComponent)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
