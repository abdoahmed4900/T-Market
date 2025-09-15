import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '',redirectTo: 'home', pathMatch: 'full' },
    {path: 'home',},
    {path: 'login',},
    {path: 'register',},
    {path: 'dashboard',},
    {path: 'profile',},
    {path : 'product/:id',},
    {path : 'category/:id',},
    {path: '**',redirectTo: 'home' }

];
