import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router } from '@inertiajs/core'
import { Link } from './link'

@Component({
  imports: [Link],
  template: '<a inertiaLink href="/users">Users</a>',
})
class LinkHost {}

@Component({
  imports: [Link],
  template: '<a inertiaLink href="/users" prefetch="mount" [cacheFor]="0">Users</a>',
})
class MountPrefetchHost {}

@Component({
  imports: [Link],
  template: '<a inertiaLink href="/users" prefetch="hover">Users</a>',
})
class HoverPrefetchHost {}

describe('Link', () => {
  afterEach(() => vi.useRealTimers())
  beforeEach(() => {
    vi.restoreAllMocks()
    TestBed.configureTestingModule({
      imports: [LinkHost],
      providers: [provideZonelessChangeDetection()],
    })
  })

  it('sets the native href and delegates an intercepted click to core', async () => {
    const visit = vi.spyOn(router, 'visit').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(LinkHost)
    await fixture.whenStable()
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))

    expect(anchor.getAttribute('href')).toBe('/users')
    expect(visit).toHaveBeenCalledOnce()
  })

  it('preserves an explicit zero cache duration for mount prefetches', async () => {
    const prefetch = vi.spyOn(router, 'prefetch').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(MountPrefetchHost)

    await fixture.whenStable()

    expect(prefetch).toHaveBeenCalledOnce()
    expect(prefetch.mock.calls[0]?.[2]).toEqual({ cacheFor: 0, cacheTags: [] })
  })

  it('cancels a pending hover prefetch when the link is clicked', async () => {
    const prefetch = vi.spyOn(router, 'prefetch').mockImplementation(() => undefined)
    const visit = vi.spyOn(router, 'visit').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(HoverPrefetchHost)
    await fixture.whenStable()
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement
    vi.useFakeTimers()

    anchor.dispatchEvent(new MouseEvent('mouseenter'))
    anchor.click()
    vi.runAllTimers()

    expect(visit).toHaveBeenCalledOnce()
    expect(prefetch).not.toHaveBeenCalled()
  })
})
