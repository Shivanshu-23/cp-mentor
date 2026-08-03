import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Trace, VisualizerDef } from './model';
import { findVisualizer } from './visualizer-catalog';
import { VizPlayerComponent } from './viz-player.component';

@Component({
  selector: 'app-visualizer-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule, VizPlayerComponent],
  templateUrl: './visualizer-page.component.html',
  styleUrls: ['./visualizer-page.component.scss']
})
export class VisualizerPageComponent implements OnInit {
  def?: VisualizerDef;
  trace?: Trace;
  activePresetIndex = 0;
  customInput = '';
  customError = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.def = findVisualizer(slug);
    if (this.def?.presets.length) this.loadPreset(0);
  }

  loadPreset(index: number): void {
    if (!this.def) return;
    this.activePresetIndex = index;
    this.customError = '';
    this.trace = this.def.generate(this.def.presets[index].input);
  }

  runCustomInput(): void {
    if (!this.def) return;
    try {
      const input = this.def.parseCustomInput(this.customInput);
      this.trace = this.def.generate(input);
      this.activePresetIndex = -1;
      this.customError = '';
    } catch {
      this.customError = 'Could not parse that input — check the format hint above.';
    }
  }
}
