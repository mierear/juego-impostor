import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CluesRoutingModule } from './clues-routing.module';
import { CluesComponent } from './clues.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CluesRoutingModule,
    CluesComponent
  ]
})
export class CluesModule { }
