import { NgModule } from '@angular/core';
import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';

@NgModule({
  imports: [GameComponent, GameRoutingModule],
})
export class GameModule {}
