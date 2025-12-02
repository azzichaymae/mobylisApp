import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StopSelectorPageRoutingModule } from './stop-selector-routing.module';

import { StopSelectorPage } from './stop-selector.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StopSelectorPageRoutingModule
  ],
  declarations: [StopSelectorPage]
})
export class StopSelectorPageModule {}
