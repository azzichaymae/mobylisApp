import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StopSelectorPage } from './stop-selector.page';

const routes: Routes = [
  {
    path: '',
    component: StopSelectorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StopSelectorPageRoutingModule {}
