import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { Buyer, Seller, User } from '../user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { getFirebaseErrorMessage } from '../../../core/methods';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addDoc, collection, deleteDoc, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/loader/loader';
import { fireStoreCollections } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule,CommonModule],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  constructor(private fb : FormBuilder) { }

  isPasswordVisible: boolean = false;

  passwordIcon = faEye;

  selectedRole: string = 'Buyer';

  auth = inject(AuthService);

  fireStore = inject(Firestore);

  user = signal<User | null>(null);

  registerForm !: FormGroup;

  matDialog = inject(MatDialog);

  router = inject(Router);

  roles = [
    'Buyer',
    'Seller'
  ];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name : ['', [Validators.required, Validators.minLength(3)]],
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword : ['', [Validators.required, Validators.minLength(6)]]
    },{validators: this.passwordMatchValidator('password', 'confirmPassword')});
  }

  selectRole(event : Event) {
    const element = event.target as HTMLSelectElement;
    this.selectedRole = element.value;
  }


  togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible;
      this.passwordIcon = !this.isPasswordVisible ? faEye : faEyeSlash;
  }

  removeError(control: AbstractControl, errorKey: string) {
    if (!control.errors) return;

    const { [errorKey]: _, ...otherErrors } = control.errors;
    control.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
  }

  register() {
    if (this.registerForm.valid) {
      const dialogRef = this.matDialog.open(Loader,{
      disableClose: true,
      })
      this.auth.register(this.registerForm.get('email')?.value, this.registerForm.get('password')?.value).subscribe({
      next: (value) => {
          dialogRef.close();
          let users = collection(this.fireStore, fireStoreCollections.users);
          addDoc(users, {
            uid: value.user.uid,
            name: this.registerForm.get('name')?.value,
            email: this.registerForm.get('email')?.value,
            role: this.selectedRole.toLowerCase(),
            createdAt: new Date()
          }).then(async (val) => { 
            let userData;
            if(this.selectedRole.toLowerCase() == 'buyer'){
                userData = {
                uid: value.user.uid,
                name: this.registerForm.get('name')?.value,
                email: this.registerForm.get('email')?.value,
                role: 'buyer',
                createdAt: new Date(),
                cartProducts: [],
                ordersIds : [],
                wishListIds: [],
              } as Buyer;
            }else{
              userData  = {
                uid: value.user.uid,
                name: this.registerForm.get('name')?.value,
                email: this.registerForm.get('email')?.value,
                role: 'seller',
                createdAt: new Date(),
                ordersIds : [],
                productsIds : [],
                totalProductsSold: 0,
                totalRevenue: 0,
              } as Seller;
            }    
            
            await setDoc(doc(this.fireStore, fireStoreCollections.users, value.user.uid), userData);
            await deleteDoc(doc(this.fireStore, fireStoreCollections.users, val.id));
            alert('Registration successful!');
            this.registerForm.reset();
            this.router.navigate(['/login'], { replaceUrl: true });
          });
      },
      error: (err) => {
        dialogRef.close();
        let message = getFirebaseErrorMessage(err.code);
        alert(message);
      }
    });
    }
  }

  passwordMatchValidator(passwordControl: string, confirmPasswordControl: string): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const password = form.get(passwordControl)?.value;
    const confirmPassword = form.get(confirmPasswordControl)?.value;

    if(password != confirmPassword) {
      form.get(confirmPasswordControl)?.setErrors({ mismatch: true });
      return { mismatch: true };
    }else{
      if(form.get(confirmPasswordControl)?.hasError('mismatch')){
        this.removeError(form.get(confirmPasswordControl)!, 'mismatch');
      }
    }

    return null;
  };
}
}
