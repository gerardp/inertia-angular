import { NgTemplateOutlet } from '@angular/common'
import { Component, Directive, TemplateRef, afterNextRender, contentChild, inject, signal } from '@angular/core'
import { InertiaRuntime } from './runtime'

@Directive({ selector: 'ng-template[inertiaWhenMountedContent]' })
export class WhenMountedContent {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef)
}

@Directive({ selector: 'ng-template[inertiaWhenMountedFallback]' })
export class WhenMountedFallback {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef)
}

@Component({
  selector: 'inertia-when-mounted',
  imports: [NgTemplateOutlet],
  template: `
    @if (mounted()) {
      <ng-container [ngTemplateOutlet]="content()?.template ?? null" />
    } @else {
      <ng-container [ngTemplateOutlet]="fallback()?.template ?? null" />
    }
  `,
})
export class WhenMounted {
  // False only on the server and during the initial hydration render, so the fallback shows
  // there and the content shows everywhere else, remounts included
  readonly mounted = signal(inject(InertiaRuntime).hydrated())
  readonly content = contentChild(WhenMountedContent)
  readonly fallback = contentChild(WhenMountedFallback)

  constructor() {
    afterNextRender(() => this.mounted.set(true))
  }
}
