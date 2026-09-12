import { DestroyRef, afterNextRender, inject, signal, type Signal } from '@angular/core'
import { router, type PollOptions, type ReloadOptions } from '@inertiajs/core'

export function usePoll(
  interval: number,
  requestOptions: ReloadOptions | (() => ReloadOptions) = {},
  options: PollOptions = {},
): { stop: VoidFunction; start: VoidFunction; polling: Signal<boolean> } {
  const destroyRef = inject(DestroyRef)
  const autoStart = options.autoStart ?? true
  const polling = signal(autoStart)
  const poll = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  afterNextRender(() => {
    if (autoStart) poll.start()
  })
  destroyRef.onDestroy(poll.destroy)

  return {
    polling: polling.asReadonly(),
    stop: () => {
      poll.stop()
      polling.set(false)
    },
    start: () => {
      poll.start()
      polling.set(true)
    },
  }
}
