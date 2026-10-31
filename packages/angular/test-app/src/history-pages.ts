import { Component, input, signal } from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  Link,
  router,
  usePage,
  type ResolvedComponent,
} from 'inertia-angular'

@Component({
  selector: 'test-history-page',
  imports: [Link],
  template: `
    @for (number of numbers; track number) {
      <a inertiaLink [href]="'/history/' + number">Page {{ number }}</a>
    }
    <button type="button" (click)="router.clearHistory()">Clear History</button>
    <div>This is page {{ pageNumber() }}.</div>
    <div>Multi byte character: {{ multiByte() }}</div>
    <div style="height: 5000px"></div>
  `,
})
class HistoryPage {
  readonly pageNumber = input('')
  readonly multiByte = input('')
  readonly numbers = [1, 2, 3, 4, 5]
  readonly router = router
}

@Component({
  selector: 'test-history-version',
  imports: [Link],
  template: '<a inertiaLink href="/history/version/1">Page 1</a><a inertiaLink href="/history/version/2">Page 2</a>',
})
class HistoryVersion {}

@Component({
  selector: 'test-history-throttle',
  imports: [Link],
  template:
    '<h1>History Throttle Test</h1><p id="call-count">State updates: {{ callCount() }}</p><button id="trigger" type="button" (click)="trigger()">Trigger Rapid State Updates</button><a inertiaLink id="home-link" href="/">Go Home</a>',
})
class HistoryThrottle {
  readonly callCount = signal(0)
  trigger(): void {
    for (let index = 0; index < 120; index++) {
      this.callCount.set(index + 1)
      router.remember({ value: index }, `key-${index}`)
    }
  }
}

@Component({
  selector: 'test-history-quota',
  imports: [Link],
  template: `
    <h1>History Quota Test - Page {{ pageNumber() }}</h1>
    <p>Data size: {{ formattedSize() }} bytes</p>
    <div style="margin-top: 20px">
      @for (number of numbers; track number) {
        <a inertiaLink [href]="'/history-quota/' + number" style="margin-right: 10px">Page {{ number }}</a>
      }
      <a inertiaLink href="/history-quota/deferred">Deferred</a>
    </div>
    <div style="height: 5000px"></div>
  `,
})
class HistoryQuota {
  readonly pageNumber = input.required<number>()
  readonly largeData = input('')
  readonly numbers = Array.from({ length: 20 }, (_, index) => index + 1)
  formattedSize(): string {
    return this.largeData().length.toLocaleString()
  }
}

@Component({
  selector: 'test-history-quota-deferred',
  imports: [Deferred, DeferredContent, DeferredFallback],
  template: `
    <h1>History Quota Test - Deferred</h1>
    <inertia-deferred data="largeData">
      <ng-template inertiaDeferredFallback><p>Loading large data...</p></ng-template>
      <ng-template inertiaDeferredContent>
        <p>Data size: {{ page().props.largeData?.length?.toLocaleString() }} bytes</p>
      </ng-template>
    </inertia-deferred>
  `,
})
class HistoryQuotaDeferred {
  readonly page = usePage<{ largeData?: string }>()
}

@Component({
  selector: 'test-history-prefetch',
  imports: [Link],
  template: `
    <a inertiaLink href="/history/prefetch/dashboard" [prefetch]="true" cacheFor="1m">Dashboard</a>
    <a inertiaLink href="/history/prefetch/reports" [prefetch]="true" cacheFor="1m">Reports</a>
    <a inertiaLink href="/history/prefetch/signed-out">Sign out</a>
    <div>This is the {{ page() }} page.</div>
    <div>Loaded at: {{ loadedAt() }}</div>
  `,
})
class HistoryPrefetch {
  readonly page = input('')
  readonly loadedAt = input(0)
}

@Component({
  selector: 'test-encrypted-history-page',
  imports: [Link],
  template: `
    <a inertiaLink href="/encrypted-history/public">Public page</a>
    <a inertiaLink href="/encrypted-history/private">Private page</a>
    <a inertiaLink href="/encrypted-history/logout">Log out</a>
    <h1>{{ title() }}</h1>
    @if (token()) {
      <div>
        Token: <span id="token">{{ token() }}</span>
      </div>
    }
  `,
})
class EncryptedHistoryPage {
  readonly title = input('')
  readonly token = input<string>()
}

@Component({ selector: 'test-history-version-reload', template: '<div id="deploy">{{ deploy() }}</div>' })
class HistoryVersionReload {
  readonly deploy = input('')
}

export const historyPages: Record<string, ResolvedComponent> = {
  'History/Page': HistoryPage,
  'History/Version': HistoryVersion,
  'History/Prefetch': HistoryPrefetch,
  'EncryptedHistory/Page': EncryptedHistoryPage,
  HistoryThrottle,
  'HistoryQuota/Page': HistoryQuota,
  'HistoryQuota/Deferred': HistoryQuotaDeferred,
  HistoryVersionReload,
}
