import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppLogoComponent } from './components/app-logo.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppLogoComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppLogoComponent,
  ],
})
export class SharedModule {}
