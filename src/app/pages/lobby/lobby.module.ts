import { NgModule } from '@angular/core';
import { LobbyComponent } from './lobby.component';
import { LobbyRoutingModule } from './lobby-routing.module';

@NgModule({
  imports: [LobbyComponent, LobbyRoutingModule],
})
export class LobbyModule {}
