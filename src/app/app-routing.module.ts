import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StagingComponent } from './staging/staging.component';
import { UserComponent } from './user/user.component';


const routes: Routes = [
  {
    path: 'staging/:id',
    component: StagingComponent,
  },
  {
    path: 'user/:id',
    component: UserComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
