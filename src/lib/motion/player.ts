/** Shared production animation transport. The lab controls these same Animation objects. */
export class MotionPlayer {
 animations: Animation[] = [];
 duration = 0;
 reduced = false;
 rate = 1;
 onupdate?: () => void;
 frames = new Set<() => void>();
 private frame = 0;
 get time() { return Math.max(0, ...this.animations.map(a => Number(a.currentTime ?? 0))); }
 get running() { return this.animations.some(a => a.playState === 'running'); }
 play(animations: Animation[], duration: number) {
  this.clear(); this.animations = animations; this.duration = duration;
  for (const animation of animations) { animation.playbackRate = this.rate; }
  this.watch();
 }
 private notify() { for (const render of this.frames) render(); this.onupdate?.(); }
 private watch = () => {
  cancelAnimationFrame(this.frame); this.notify();
  if (this.running) this.frame = requestAnimationFrame(this.watch);
 };
 pause() { for (const a of this.animations) a.pause(); this.notify(); }
 resume() { for (const a of this.animations) a.play(); this.watch(); }
 seek(time: number) { this.pause(); for (const a of this.animations) a.currentTime = Math.min(this.duration, Math.max(0, time)); this.notify(); }
 replay() { this.seek(0); this.resume(); }
 speed(rate: number) { this.rate = rate; for (const a of this.animations) a.updatePlaybackRate(rate); }
 clear() { cancelAnimationFrame(this.frame); for (const a of this.animations) a.cancel(); this.animations = []; this.duration = 0; this.notify(); }
}
