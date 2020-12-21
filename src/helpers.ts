interface ListenerOptions {
  event: string;
  target: HTMLElement;
  handler: (this: HTMLElement, event: Event) => any;
  passive?: boolean;
  capture?: boolean;
}

export function watchForEvent(opts: ListenerOptions){
  const { handler, target, event } = opts;
  target.addEventListener(event, handler, opts);
  return () => target.removeEventListener(event, handler);
}