import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslatePipe } from '@ngx-translate/core';
import { Support } from './interfaces/support';
import { Subject, takeUntil } from 'rxjs';
import { SupportService } from './services/support.service';

@Component({
  selector: 'app-support-page',
  imports: [FormsModule, ReactiveFormsModule,TranslatePipe,CommonModule],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class SupportPage {
    fb = inject(FormBuilder);
    supportForm = this.fb.group({
        title: ['',[Validators.required,Validators.minLength(5)]],
        complaint: ['',[Validators.required,Validators.minLength(25)]],
    })
    destroy$ = new Subject<void>();
    supportService = inject(SupportService);

    submitSupport(){
        let support : Support = {
            complaintTitle: this.getField('title')!.value,
            complaint: this.getField('complaint')!.value,
            userId: localStorage.getItem('token')!,
            userName: localStorage.getItem('name')!,
            complaintDate: new Date().toDateString(),
        }
        this.supportService.addSupport(support).pipe(takeUntil(this.destroy$)).subscribe(
            {
                next : (value) =>{
                    console.log('support added!');
                    
                },
            }
        )
    }

    getField(controlName:string){
        return this.supportForm.get(controlName)
    }
}
