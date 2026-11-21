import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
  model,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-step',
  template: `<ng-template><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step {
  readonly label = input.required<string>();
  readonly stepControl = input<AbstractControl>();
  readonly content = viewChild.required(TemplateRef);
}

@Component({
  selector: 'app-stepper',
  imports: [MatStepper, MatStep, NgTemplateOutlet],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-stepper' },
})
export class Stepper {
  readonly linear = input(false, { transform: booleanAttribute });
  readonly index = model(0);
  readonly steps = contentChildren(Step);
  private readonly stepper = viewChild(MatStepper);

  control(step: Step): AbstractControl {
    return step.stepControl() as AbstractControl;
  }

  constructor() {
    afterRenderEffect(() => {
      const index = this.index();
      const stepper = this.stepper();
      if (!stepper || this.steps().length === 0) {
        return;
      }

      const steps = stepper.steps?.toArray() ?? [];
      for (const [position, step] of steps.entries()) {
        if (position < index) {
          const control = step.stepControl;
          step.completed = !control || (control.valid && !control.pending);
        }
      }

      if (stepper.selectedIndex !== index) {
        stepper.selectedIndex = index;
        if (stepper.selectedIndex !== index) {
          this.index.set(stepper.selectedIndex);
        }
      }
    });
  }
}
