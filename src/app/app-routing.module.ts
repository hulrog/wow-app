import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DungeonsComponent } from './dungeons/dungeons.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'dungeons', component: DungeonsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
