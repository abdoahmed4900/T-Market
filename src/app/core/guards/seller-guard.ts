import { CanActivateFn } from '@angular/router';

export const sellerGuard: CanActivateFn = (route, state) => {
  let token = localStorage.getItem('token') as any;
  if (token) {
    let role = localStorage.getItem('role') as any;
    if(role == 'seller'){
        return true;
    }
    return false;
  }
  return false;
};
