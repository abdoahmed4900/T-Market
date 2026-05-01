import { Component, output } from '@angular/core';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-password-visibility-icon',
  imports: [FaIconComponent],
  templateUrl: './password-visibility-icon.html',
  styleUrl: './password-visibility-icon.scss',
})
export class PasswordVisibilityIcon {

  isPasswordVisible = false;
  passwordIcon = faEye;

  visibilityChanged = output<boolean>()

  togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible;
      this.passwordIcon = this.isPasswordVisible ? faEyeSlash : faEye;
      this.visibilityChanged.emit(this.isPasswordVisible);
  }
}
