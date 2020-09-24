interface ListenerOptions {
  event: string;
  target: HTMLElement;
  handler: (this: HTMLElement, ev: Event) => any;
  passive?: boolean;
  capture?: boolean;
}

export function listenEvent(opts: ListenerOptions){
  const { handler, target, event } = opts;
  target.addEventListener(event, handler, opts);
  return () => target.removeEventListener(event, handler);
}