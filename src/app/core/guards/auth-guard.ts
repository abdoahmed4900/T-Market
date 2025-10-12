import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  let user = localStorage.getItem('user');
  if (user) {
    return true;
  }
  return false;
};
