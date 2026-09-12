import { Component, signal, viewChild, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router, type VisitOptions } from '@inertiajs/core'
import { Form, useFormContext } from './form'

@Component({ selector: 'test-form-child', template: '' })
class FormChild {
  readonly form = useFormContext()
}

@Component({
  imports: [Form, FormChild],
  template: `
    <form
      inertiaForm
      method="post"
      action="/users"
      #form="inertiaForm"
      [cancelOnUnmount]="cancelOnUnmount()"
      (cancel)="cancelled.set(true)"
    >
      <input name="user.name" value="Ada" />
      <button type="submit" name="intent" value="save">Save</button>
      <test-form-child />
    </form>
  `,
})
class FormHost {
  readonly cancelOnUnmount = signal(false)
  readonly cancelled = signal(false)
  readonly form = viewChild.required<Form>('form')
  readonly child = viewChild.required(FormChild)
}

describe('Form', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    TestBed.configureTestingModule({
      imports: [FormHost],
      providers: [provideZonelessChangeDetection()],
    })
  })

  it('serializes the native form and exposes the same context to descendants', async () => {
    const fixture = TestBed.createComponent(FormHost)
    await fixture.whenStable()

    expect(fixture.componentInstance.form().getData()).toEqual({ user: { name: 'Ada' } })
    expect(fixture.componentInstance.child().form).toBe(fixture.componentInstance.form())
  })

  it('includes the submitter and delegates a post to core', async () => {
    const post = vi.spyOn(router, 'post').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(FormHost)
    await fixture.whenStable()
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement

    fixture.componentInstance.form().submit(button)

    expect(post.mock.calls[0]?.[0]).toBe('/users')
    expect(post.mock.calls[0]?.[1]).toEqual({ user: { name: 'Ada' }, intent: 'save' })
  })

  it('exposes cancel through the form context while preserving the cancel output', async () => {
    const post = vi.spyOn(router, 'post').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(FormHost)
    await fixture.whenStable()
    fixture.componentInstance.form().submit()
    const options = post.mock.calls[0]?.[2] as VisitOptions
    const cancel = vi.fn(() => options.onCancel?.())
    options.onCancelToken?.({ cancel })

    fixture.componentInstance.child().form?.cancel()

    expect(cancel).toHaveBeenCalledOnce()
    expect(fixture.componentInstance.cancelled()).toBe(true)
  })

  it.each([false, true])('respects cancelOnUnmount=%s at destruction', async (cancelOnUnmount) => {
    const post = vi.spyOn(router, 'post').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(FormHost)
    await fixture.whenStable()
    fixture.componentInstance.form().submit()
    const options = post.mock.calls[0]?.[2] as VisitOptions
    const cancel = vi.fn()
    options.onCancelToken?.({ cancel })

    fixture.componentInstance.cancelOnUnmount.set(cancelOnUnmount)
    await fixture.whenStable()
    fixture.destroy()

    expect(cancel).toHaveBeenCalledTimes(Number(cancelOnUnmount))
  })
})
