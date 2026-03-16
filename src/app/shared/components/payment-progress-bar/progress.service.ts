import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ProgressService {
  progressPercent = signal(0);

  readonly steps = {
    FIRST: 33,
    SECOND: 66,
    THIRD: 100
  };
  
  goToFirstStep() { 
    setTimeout(() => {
      this.progressPercent.set(this.steps.FIRST);
    },10)
  }
  goToSecondStep() {
    setTimeout(() => {
      this.progressPercent.set(this.steps.SECOND);
    },10)      
  }
  goToFinalStep() {
    setTimeout(() => {
      this.progressPercent.set(this.steps.THIRD);
    },10)
    setTimeout(() => {
      this.reset();
    }, 2000);
  }
  reset() { 
    this.progressPercent.set(0);    
  }
}