import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavouritePage } from './favourite.page';

import { FavouritePageRoutingModule } from './favourite-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    FavouritePageRoutingModule
  ],
  declarations: [FavouritePage]
})
export class FavouritePageModule {}
