import { NgModule } from '@angular/core';
import { VotingComponent } from './voting.component';
import { VotingRoutingModule } from './voting-routing.module';

@NgModule({
  imports: [VotingComponent, VotingRoutingModule],
})
export class VotingModule {}
