// app.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { sellerGuard } from './core/guards/seller-guard';
import { HomeComponent } from './features/home-component/home-component';
import { LoginComponent } from './features/auth/login/login';
import { buyerGuard } from './core/guards/buyer-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'PAGE_TITLES.HOME_PAGE' }
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
    data: { title: 'PAGE_TITLES.CATEGORIES_PAGE' }
  },
  {
    path: 'shop/:category',
    loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
    title: (route) => route.paramMap.get('category') || 'Category'
  },
  {
    path: 'brands',
    loadComponent: () => import('./features/brands/brands').then((m) => m.Brands),
    data: { title: 'PAGE_TITLES.BRANDS_PAGE' }
  },
  {
    path: 'support',
    loadComponent: () => import('./features/support/support').then((m) => m.SupportPage),
    data: { title: 'PAGE_TITLES.ADD_SUPPORT_PAGE' }
  },
  {
    path: 'supports',
    loadComponent: () => import('./features/admin/components/show-supports/show-supports').then((m) => m.ShowSupports),
    canActivate: [adminGuard],
    data: { title: 'PAGE_TITLES.SHOW_COMPLAINTS_PAGE' }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'PAGE_TITLES.LOGIN_PAGE' }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
    data: { title: 'PAGE_TITLES.REGISTER_PAGE' }
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/components/reset-password/reset-password').then(m => m.ResetPassword),
    data: { title: 'PAGE_TITLES.RESET_PASSWORD_PAGE' }
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product-details/product-details').then(m => m.ProductDetails),
    data: { title: 'PAGE_TITLES.PRODUCT_DETAILS_PAGE' }
  },
  {
    path: 'brand/:name',
    loadComponent: () => import('./features/brand-products/brand-products').then(m => m.BrandProducts),
    title: (route) => route.paramMap.get('name') || 'Brand'
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart').then(m => m.CartComponent),
    data: { title: 'PAGE_TITLES.CART_PAGE' }
  },
  {
    path: 'wishlist',
    canActivate: [buyerGuard],
    loadComponent: () => import('./features/wishlist/wishlist').then(m => m.Wishlist),
    data: { title: 'PAGE_TITLES.WISHLIST_PAGE' }
  },
  {
    path: 'checkout',
    canActivate: [buyerGuard],
    loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout),
    data: { title: 'PAGE_TITLES.CHECKOUT_PAGE' }
  },
  {
    path: 'orders',
    canActivate: [buyerGuard],
    loadComponent: () => import('./features/orders/orders').then(m => m.Orders),
    data: { title: 'PAGE_TITLES.ORDERS_PAGE' }
  },
  {
    path: 'order/:id',
    canActivate: [buyerGuard],
    loadComponent: () => import('./features/orders/components/order-details/order-details').then(m => m.OrderDetails),
    data: { title: 'PAGE_TITLES.ORDER_DETAILS_PAGE' },
  },
  {
    path: 'new-product',
    canActivate: [sellerGuard],
    loadComponent: () => import('./features/home-component/seller-home-component/components/new-product/new-product').then(m => m.NewProduct),
    data: { title: 'PAGE_TITLES.NEW_PRODUCT_PAGE' }
  },
  {
    path: 'add-new-user',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/components/add-new-user/add-new-user').then(m => m.AddNewUser),
    data: { title: 'PAGE_TITLES.NEW_USER_PAGE' }
  },
  {
    path: 'update-product/:id',
    canActivate: [sellerGuard],
    loadComponent: () => import('./features/home-component/seller-home-component/components/update-product/update-product').then(m => m.UpdateProduct),
    data: {
      title: 'PAGE_TITLES.UPDATE_PRODUCT_PAGE'
    },
  },
  {
    path: 'new-category',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/components/new-category/new-category').then(m => m.NewCategory),
    data: { title: 'PAGE_TITLES.NEW_CATEGORY_PAGE' }
  },
  {
    path: 'new-brand',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/components/new-brand/new-brand').then(m => m.NewBrand),
    data: { title: 'PAGE_TITLES.NEW_BRAND_PAGE' }
  },
  { path: '**', redirectTo: 'home' }
];