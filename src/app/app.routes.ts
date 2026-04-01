import { adminGuard } from './core/guards/admin.guard';
import { sellerGuard } from './core/guards/seller-guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: 'home', loadComponent: () => import('./features/home-component/home-component').then((m) => m.HomeComponent),
  },
  { path: 'shop', loadComponent : () => import('./features/categories/categories').then((m) => m.Categories) },
  { path: 'brands', loadComponent : () => import('./features/brands/brands').then((m) => m.Brands) },
  { path: 'support', loadComponent : () => import('./features/support/support').then((m) => m.SupportPage) },
  { path: 'supports', loadComponent : () => import('./features/admin/components/show-supports/show-supports').then((m) => m.ShowSupports) ,canActivate: [adminGuard]},
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
    loadComponent: () => import('./features/auth/components/reset-password/reset-password')
      .then(m => m.ResetPassword)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product-details/product-details')
      .then(m => m.ProductDetails)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart')
      .then(m => m.CartComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/wishlist/wishlist')
      .then(m => m.Wishlist)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout')
      .then(m => m.Checkout)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders')
      .then(m => m.Orders)
  },
  {
    path: 'order/:id',
    loadComponent: () => import('./features/orders/components/order-details/order-details')
      .then(m => m.OrderDetails)
  },
  {
    path: 'new-product',
    canActivate: [sellerGuard],
    loadComponent: () => import('./features/home-component/seller-home-component/components/new-product/new-product')
      .then(m => m.NewProduct)
  },
  {
    path: 'add-new-user',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/components/add-new-user/add-new-user')
      .then(m => m.AddNewUser)
  },
  {
    path: 'update-product/:id',
    canActivate: [sellerGuard],
    loadComponent: () => import('./features/home-component/seller-home-component/components/update-product/update-product')
      .then(m => m.UpdateProduct)
  },
  {
    path: 'new-category',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/components/new-category/new-category')
      .then(m => m.NewCategory)
  },
  {
    path: 'new-brand',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/components/new-brand/new-brand')
      .then(m => m.NewBrand)
  },
  {path: '**',redirectTo: 'home' }
];
