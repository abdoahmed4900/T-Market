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
    this.goToStep(this.steps.FIRST)
  }
  goToSecondStep() {
    this.goToStep(this.steps.SECOND)
  }
  goToFinalStep() {
    this.goToStep(this.steps.THIRD)
    setTimeout(() => {
      this.reset();
    }, 2000);
  }

  goToStep(step: number) {
    setTimeout(() => {
      this.progressPercent.set(step);
    }, 10)
  }
  reset() {
    this.progressPercent.set(0);
  }
}