import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProblemService, Problem } from '../../core/services/problem.service';
import { RESOURCE_SECTIONS, GAME_PLAN } from './resources.data';
import * as THREE from 'three';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') heroCanvas?: ElementRef<HTMLCanvasElement>;

  daily: Problem | null = null;

  loadingDaily = true;

  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  readonly resourceSections = RESOURCE_SECTIONS;
  readonly gamePlan = GAME_PLAN;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private farStars?: THREE.Points;
  private nearStars?: THREE.Points;
  private nebulae: THREE.Sprite[] = [];
  private disposables: Array<{ dispose(): void }> = [];
  private animationId?: number;
  private clock = 0;
  private mouseX = 0;
  private mouseY = 0;
  private reducedMotion = false;

  constructor(
    private problemService: ProblemService,
    private snackBar: MatSnackBar,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadDaily();
  }

  ngAfterViewInit(): void {
    this.initHeroScene();
  }

  ngOnDestroy(): void {
    this.teardownHeroScene();
  }

  loadDaily(): void {
    this.loadingDaily = true;
    this.problemService.getDailyProblem().subscribe({
      next: p => { this.daily = p; this.loadingDaily = false; },
      error: () => { this.loadingDaily = false; this.snackBar.open('Could not load daily problem', '', { duration: 3000 }); }
    });
  }

  openChatGptAnalysis(problem: Problem): void {
    const topics = problem.topics?.length ? problem.topics.join(', ') : 'N/A';
    const description = (problem.description || '').trim().slice(0, 500);
    const prompt =
      `Analyze this LeetCode problem in depth.\n\n` +
      `Title: ${problem.title} (#${problem.leetcodeId})\n` +
      `Difficulty: ${problem.difficulty}\n` +
      `Topics: ${topics}\n` +
      `LeetCode link: ${problem.leetcodeUrl}\n\n` +
      `Description:\n${description}\n\n` +
      `Please explain the problem simply, then give brute-force, better, and optimal ` +
      `approaches with time/space complexity and code, plus common mistakes, edge cases, ` +
      `and interview tips.`;

    window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank', 'noopener');
  }

  difficultyClass(d: string): string {
    return d?.toLowerCase() ?? 'easy';
  }

  difficultyColor(d: string): string {
    const map: Record<string, string> = { EASY: '#3fb950', MEDIUM: '#d29922', HARD: '#f85149' };
    return map[d] ?? '#8b949e';
  }

  necessityClass(n: string): string {
    const key = n.toLowerCase();
    if (key.startsWith('must')) return 'must';
    if (key.startsWith('high')) return 'high';
    if (key.startsWith('medium-high')) return 'high';
    if (key.startsWith('medium')) return 'medium';
    return 'low';
  }

  // ── Page background: 3D space / galaxy / starfield (Three.js) ──────────

  private initHeroScene(): void {
    const canvas = this.heroCanvas?.nativeElement;
    if (!canvas) return;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);

    const starTexture = this.createGlowTexture('#ffffff', 0.35);
    this.disposables.push(starTexture);

    // Two star layers at different depths/densities for a parallax starfield
    this.farStars = this.createStarLayer(900, 46, 0.09, 0.5, starTexture);
    this.nearStars = this.createStarLayer(260, 26, 0.2, 0.85, starTexture);
    this.scene.add(this.farStars, this.nearStars);

    // Soft glowing nebula clouds (canvas-generated radial gradients, no image assets)
    const nebulaSpecs: Array<[string, number, number, number, number]> = [
      ['#58a6ff', -7, 2.5, -12, 22],
      ['#bc8cff', 8, -3, -14, 26],
      ['#3fb950', -2, -5, -16, 20]
    ];
    for (const [color, x, y, z, scale] of nebulaSpecs) {
      const sprite = this.createNebulaSprite(color, scale);
      sprite.position.set(x, y, z);
      this.nebulae.push(sprite);
      this.scene.add(sprite);
    }

    canvas.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    if (this.reducedMotion) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.zone.runOutsideAngular(() => this.animateHero());
    }
  }

  private createStarLayer(count: number, spread: number, size: number, brightness: number, texture: THREE.Texture): THREE.Points {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const tint = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread - spread * 0.15;

      // Mostly white/blue-white starlight, occasional warm or violet star
      const r = Math.random();
      if (r < 0.75) tint.setHSL(0.58, 0.25, 0.85 + Math.random() * 0.15);
      else if (r < 0.9) tint.setHSL(0.7, 0.4, 0.75);
      else tint.setHSL(0.1, 0.5, 0.75);

      colors[i * 3] = tint.r * brightness;
      colors[i * 3 + 1] = tint.g * brightness;
      colors[i * 3 + 2] = tint.b * brightness;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.disposables.push(geometry);

    const material = new THREE.PointsMaterial({
      size,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.disposables.push(material);

    return new THREE.Points(geometry, material);
  }

  // Soft radial-gradient dot, drawn on an offscreen canvas — used for both
  // round star points and the larger nebula cloud sprites (no image assets).
  private createGlowTexture(color: string, coreStop: number): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, color + 'ff');
    gradient.addColorStop(coreStop, color + '88');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  private createNebulaSprite(color: string, scale: number): THREE.Sprite {
    const texture = this.createGlowTexture(color, 0.4);
    this.disposables.push(texture);

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.disposables.push(material);

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale, scale, 1);
    return sprite;
  }

  private onPointerMove = (e: PointerEvent): void => {
    this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  private onResize = (): void => {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onVisibilityChange = (): void => {
    if (document.hidden) {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = undefined;
      }
    } else if (!this.reducedMotion && !this.animationId) {
      this.zone.runOutsideAngular(() => this.animateHero());
    }
  };

  private animateHero = (): void => {
    if (!this.renderer || !this.scene || !this.camera || !this.farStars || !this.nearStars) return;

    this.clock += 0.01;

    // Far layer drifts slowly, near layer drifts faster — parallax depth
    this.farStars.rotation.y += 0.00018;
    this.nearStars.rotation.y += 0.00055;
    this.nearStars.rotation.x += 0.00012;

    // Gentle nebula "breathing" glow
    this.nebulae.forEach((sprite, i) => {
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = 0.26 + Math.sin(this.clock + i * 2) * 0.08;
    });

    // Subtle mouse parallax on the camera
    this.camera.position.x += (this.mouseX * 1.2 - this.camera.position.x) * 0.02;
    this.camera.position.y += (-this.mouseY * 0.8 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animateHero);
  };

  private teardownHeroScene(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.heroCanvas?.nativeElement.removeEventListener('pointermove', this.onPointerMove);

    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    this.nebulae = [];
    this.renderer?.dispose();
  }
}
