import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackState, Highlight, Pointer } from '../model';
import { ArrayRendererComponent } from './array-renderer.component';

@Component({
  selector: 'app-stack-renderer',
  standalone: true,
  imports: [CommonModule, ArrayRendererComponent],
  templateUrl: './stack-renderer.component.html',
  styleUrls: ['./stack-renderer.component.scss']
})
export class StackRendererComponent {
  @Input() state!: StackState;
  @Input() highlights: Highlight[] = [];
  @Input() pointers: Pointer[] = [];

  get arrayState() {
    return { values: this.state.array };
  }

  get reversedStack(): (number | string)[] {
    return [...this.state.stack].reverse(); // top of stack drawn first (highest)
  }
}
