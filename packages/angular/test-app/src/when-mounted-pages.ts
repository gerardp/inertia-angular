import { Component, afterNextRender, signal } from '@angular/core'
import { Link, WhenMounted, WhenMountedContent, WhenMountedFallback, type ResolvedComponent } from 'inertia-angular'

// Plain counters rather than signals: both components read them while rendering,
// which is the only moment the tests care about
const counts = { fallbackRenders: 0, childMounts: 0 }

@Component({
  selector: 'test-when-mounted-child',
  template: `
    <div>
      <span id="child-status">{{ status() }}</span>
      <span id="child-count">{{ count() }}</span>
      <span id="fallback-renders">{{ counts.fallbackRenders }}</span>
      <span id="child-mounts">{{ counts.childMounts }}</span>
      <button id="child-increment" type="button" (click)="count.set(count() + 1)">Increment</button>
    </div>
  `,
})
class WhenMountedChild {
  readonly counts = counts
  readonly status = signal<'pending' | 'ready'>('pending')
  readonly count = signal(0)

  constructor() {
    counts.childMounts++
    afterNextRender(() => setTimeout(() => this.status.set('ready'), 100))
  }
}

@Component({
  selector: 'test-when-mounted-fallback',
  template: '<p id="when-mounted-fallback" data-testid="when-mounted-fallback">Loading widget...</p>',
})
class WhenMountedFallbackContent {
  constructor() {
    counts.fallbackRenders++
  }
}

@Component({
  selector: 'test-when-mounted',
  imports: [Link, WhenMounted, WhenMountedContent, WhenMountedFallback, WhenMountedChild, WhenMountedFallbackContent],
  template: `
    <h1 id="title">WhenMounted</h1>
    <inertia-when-mounted>
      <ng-template inertiaWhenMountedFallback><test-when-mounted-fallback /></ng-template>
      <ng-template inertiaWhenMountedContent>
        <p id="when-mounted-content">Client path: /when-mounted</p>
        <test-when-mounted-child />
      </ng-template>
    </inertia-when-mounted>
    <a inertiaLink id="revisit-link" href="/when-mounted">Revisit</a>
    <a inertiaLink id="preserve-state-link" href="/when-mounted" [preserveState]="true">Revisit (preserve state)</a>
    <a inertiaLink id="leave-link" href="/">Leave</a>
  `,
})
class WhenMountedPage {}

@Component({
  selector: 'test-ssr-when-mounted',
  imports: [Link, WhenMounted, WhenMountedContent, WhenMountedFallback, WhenMountedChild, WhenMountedFallbackContent],
  template: `
    <h1 data-testid="ssr-title">SSR WhenMounted</h1>
    <inertia-when-mounted>
      <ng-template inertiaWhenMountedFallback><test-when-mounted-fallback /></ng-template>
      <ng-template inertiaWhenMountedContent>
        <p data-testid="when-mounted-content">Client path: {{ clientPath() }}</p>
        <test-when-mounted-child />
      </ng-template>
    </inertia-when-mounted>
    <a inertiaLink data-testid="leave-link" href="/ssr/page2">Leave</a>
    <a inertiaLink data-testid="revisit-link" href="/ssr/when-mounted">Revisit</a>
  `,
})
class SsrWhenMountedPage {
  readonly clientPath = () => window.location.pathname
}

export const whenMountedPages: Record<string, ResolvedComponent> = {
  WhenMounted: WhenMountedPage,
  'SSR/WhenMounted': SsrWhenMountedPage,
}
