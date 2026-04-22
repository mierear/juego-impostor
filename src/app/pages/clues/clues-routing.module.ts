import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CluesComponent } from './clues.component';

const routes: Routes = [
  {
    path: '',
    component: CluesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CluesRoutingModule { }
