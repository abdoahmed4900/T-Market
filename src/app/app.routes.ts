import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { Categories } from './features/categories/categories';

export const routes: Routes = [
     { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'shop', component: Categories },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password')
      .then(m => m.ResetPassword)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./shared/product-details/product-details')
      .then(m => m.ProductDetails)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart')
      .then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout')
      .then(m => m.Checkout)
  },

    // {path: 'dashboard',},
    // {path: 'profile',},
    // {path : 'product/:id',},
    // {path : 'category/:id',},
    {path: '**',redirectTo: 'home' }
];
