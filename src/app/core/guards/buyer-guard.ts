import { CanActivateFn } from '@angular/router';

export const buyerGuard: CanActivateFn = (route, state) => {
  let user = localStorage.getItem('user') as any;
  if (user) {
    if(user['role'] == 'buyer'){
        return true;
    }
    return false;
  }
  return false;
};
