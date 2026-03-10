import { PasswordVisibilityIcon } from './../../../shared/components/password-visibility-icon/password-visibility-icon';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { getFirebaseErrorMessage } from '../../../core/methods';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/components/loader/loader';
import { TranslatePipe } from '@ngx-translate/core';
import { passwordMatchValidator } from '../../../core/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule, CommonModule, TranslatePipe, PasswordVisibilityIcon],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  constructor(private fb : FormBuilder) { }

  selectedRole: string = 'Buyer';

  auth = inject(AuthService);

  fireStore = inject(Firestore);

  user = signal<User | null>(null);

  registerForm !: FormGroup;

  matDialog = inject(MatDialog);

  router = inject(Router);

  destroy = new Subject<void>();

  roles = [
    'Buyer',
    'Seller'
  ];

  isPasswordVisible = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name : ['', [Validators.required, Validators.minLength(3)]],
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword : ['', [Validators.required, Validators.minLength(6)]]
    },{validators: passwordMatchValidator('password', 'confirmPassword')});
  }
  toggleVisibility(isVisible:boolean){
    this.isPasswordVisible = isVisible;
  }

  selectRole(event : Event) {
    const element = event.target as HTMLSelectElement;
    this.selectedRole = element.value;
  }
  register() {
    if (this.registerForm.valid) {
      const dialogRef = this.matDialog.open(Loader,{
      disableClose: true,
      })
      this.auth.register(this.registerForm.get('email')?.value,this.registerForm.get('password')?.value,this.registerForm.get('name')?.value,this.selectedRole).pipe(takeUntil(this.destroy)).subscribe({
      next: (value) => {
          dialogRef.close();
          alert('Registration successful!');
          this.registerForm.reset();
          this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        dialogRef.close();
        let message = getFirebaseErrorMessage(err.code);
        alert(message);
      }
    });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
