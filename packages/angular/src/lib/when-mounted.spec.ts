import { Component, provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { InertiaRuntime } from './runtime'
import { WhenMounted, WhenMountedContent, WhenMountedFallback } from './when-mounted'

let fallbackRenders = 0

@Component({ selector: 'test-fallback', template: 'Loading' })
class Fallback {
  constructor() {
    fallbackRenders++
  }
}

@Component({
  imports: [WhenMounted, WhenMountedContent, WhenMountedFallback, Fallback],
  template: `
    <inertia-when-mounted>
      <ng-template inertiaWhenMountedFallback><test-fallback /></ng-template>
      <ng-template inertiaWhenMountedContent>Mounted</ng-template>
    </inertia-when-mounted>
  `,
})
class WhenMountedHost {}

describe('WhenMounted', () => {
  beforeEach(() => (fallbackRenders = 0))

  for (const [hydrated, expectedFallbackRenders] of [
    [false, 1],
    [true, 0],
  ] as const) {
    it(`renders the fallback ${expectedFallbackRenders} times when the app ${hydrated ? 'has' : 'has not'} hydrated`, async () => {
      TestBed.configureTestingModule({
        imports: [WhenMountedHost],
        providers: [
          provideZonelessChangeDetection(),
          { provide: InertiaRuntime, useValue: { hydrated: signal(hydrated).asReadonly() } },
        ],
      })
      const fixture = TestBed.createComponent(WhenMountedHost)
      await fixture.whenStable()

      expect(fixture.nativeElement.textContent.trim()).toBe('Mounted')
      expect(fallbackRenders).toBe(expectedFallbackRenders)
    })
  }
})
