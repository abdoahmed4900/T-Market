import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function changeTheme() : string{
    const root = document.documentElement;
    root.classList.toggle("light-theme");
    root.classList.toggle("dark-theme");
    let theme = '';
    if(root.classList.contains("light-theme")){
      theme = "light";
    } else {
      theme = "dark";
    }
    localStorage.setItem("theme", theme);
    return theme;
}

export function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function numericLengthValidator(minLength: number) {
       return (control: AbstractControl) => {
       const value = control.value?.toString() || '';
       console.log(`value.length < minLength : ${value.length < minLength}`);
       
       return value.length < minLength && value.length > 0 ? { minlength: true } : null;
      };
  }

  export function passwordMatchValidator(passwordControl: string, confirmPasswordControl: string): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const password = form.get(passwordControl)?.value;
    const confirmPassword = form.get(confirmPasswordControl)?.value;

    if(password != confirmPassword) {
      form.get(confirmPasswordControl)?.setErrors({ mismatch: true });
      return { mismatch: true };
    }else{
      if(form.get(confirmPasswordControl)?.hasError('mismatch')){
        removeFormError(form.get(confirmPasswordControl)!, 'mismatch');
      }
    }

    return null;
  };
}


  export function removeFormError(control: AbstractControl, errorKey: string) {
    if (!control.errors) return;

    const { [errorKey]: _, ...otherErrors } = control.errors;
    control.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
  }