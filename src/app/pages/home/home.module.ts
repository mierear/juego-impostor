import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  imports: [HomeComponent, HomeRoutingModule],
})
export class HomeModule {}
