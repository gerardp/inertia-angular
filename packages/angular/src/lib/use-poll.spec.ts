import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router } from '@inertiajs/core'
import { usePoll } from './use-poll'

@Component({ template: '{{ poll.polling() }}' })
class PollHost {
  readonly poll = usePoll(500)
}

@Component({ template: '{{ poll.polling() }}' })
class ManualPollHost {
  readonly poll = usePoll(500, {}, { autoStart: false })
}

describe('usePoll', () => {
  beforeEach(() => vi.restoreAllMocks())
  it.each([
    [PollHost, true],
    [ManualPollHost, false],
  ] as const)('tracks start and stop and cleans up %s', async (host, autoStart) => {
    const poll = { start: vi.fn(), stop: vi.fn(), destroy: vi.fn() }
    vi.spyOn(router, 'poll').mockReturnValue(poll)
    const fixture = TestBed.createComponent(host)
    await fixture.whenStable()

    expect(fixture.nativeElement.textContent).toBe(String(autoStart))
    expect(poll.start).toHaveBeenCalledTimes(Number(autoStart))

    fixture.componentInstance.poll.start()
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toBe('true')
    expect(poll.start).toHaveBeenCalledTimes(Number(autoStart) + 1)

    fixture.componentInstance.poll.stop()
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toBe('false')
    expect(poll.stop).toHaveBeenCalledOnce()

    fixture.destroy()
    expect(poll.destroy).toHaveBeenCalledOnce()
  })
})
