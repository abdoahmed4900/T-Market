import { Component, effect, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-input-component',
  imports: [TranslatePipe,ReactiveFormsModule],
  templateUrl: './input-component.html',
  styleUrl: './input-component.scss',
})
export class InputComponent {
  formControlName = input<string>();
  label = input<string>();
  type = input<string>();
  placeHolder = input<string>();
  formGroup = input<FormGroup>();
  control = signal<FormControl | null>(null);

  constructor(){
    effect(() => {
      const control = this.control();
      const formGroup = this.formGroup();
      if(control && formGroup){
        this.control.set(this.formGroup()!.get(this.formControlName()!)! as FormControl)
      }
    })
  }
  get isValid(): boolean {
    return this.control()!.valid && this.control()!.touched;
  }

  get isInvalid(): boolean {
    return this.control()!.invalid && this.control()!.touched;
  }

  hasError(error: string): boolean {
    return this.control()!.hasError(error) && this.control()!.touched;
  }
}
