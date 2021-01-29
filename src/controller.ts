import VC, { ref, tuple, wrap } from 'react-use-controller';

import { watchForEvent } from './helpers';
import { alignedOffset, Alignment } from './measure';
import { ClientRect, getRect, observeRect } from './rect';
import { WindowContainer } from './window';

type Axis =
  | ["width", "height"]
  | ["height", "width"]

export interface Item {
  index: number;
  key: number | string;
  start: number;
  end: number;
  style: {};
}

function observeSpeed(controller: Core<any>){
  controller.once($ => $.offset, (pos: number) => {
    let interval = setInterval(() => {
      const speed = controller.speed =
        (pos - (pos = controller.offset)) * -20;

      if(!speed && pos >= 0){
        clearInterval(interval);
        if(controller.didStop) 
          controller.didStop(pos);
        observeSpeed(controller);
      }
    }, 50)
  });
}

abstract class Core<P extends Item> extends VC {
  container = ref(this.observeContainer);
  size = tuple(0, 0);
  measurements: P[] = [];
  scrollArea = 0;
  offset = 0;
  speed = 0;

  padding = tuple(0,0,0,0);
  maintain = true;
  end = false;

  overscan?: number;
  didStop?(offset: number): void;
  didReachEnd?(): void;

  abstract length: number;
  abstract horizontal: boolean;
  abstract extend(): boolean;

  Window = wrap(WindowContainer);

  static get Window(){
    return this.wrap(WindowContainer);
  }

  constructor(){
    super();

    this.requestUpdate(() => {
      let p = this.padding;

      if(typeof p == "number")
        p = [p] as any;

      else if(p.length >= 4)
        return;

      const [a, b, c] = p;

      this.padding =
        b === undefined 
          ? [a,a,a,a] :
        c === undefined 
          ? [a,b,a,b] 
          : [b,c,b,a]
    });

    if(this.didReachEnd)
      this.on($ => $.end, (is) => {
        if(is) this.didReachEnd!();
      })

    this.on($ => $.size, () => {
      this.measurements = [];
      this.scrollArea = 0;
    })
    
    observeSpeed(this);
  }

  get scrollKey(){
    return this.horizontal
      ? 'scrollLeft'
      : 'scrollTop';
  }

  get axis(): Axis {
    return this.horizontal
      ? ['width', 'height']
      : ['height', 'width'];
  }

  protected observeContainer(element: HTMLElement){
    const [ x, y ] = this.axis;

    if(!element)
      return;

    const updateOffset = () => {
      this.offset = element[this.scrollKey];
    }

    const applySize = (rect: ClientRect) => {
      const [top, right, bottom, left] = this.padding;

      if(this.horizontal)
        rect.height -= top + bottom;
      else
        rect.width -= left + right;

      this.size = [rect[x], rect[y]];
    }

    updateOffset();
    applySize(getRect(element));

    const releaseHandler = watchForEvent({
      event: 'scroll',
      target: element,
      handler: updateOffset,
      capture: false,
      passive: true,
    });

    if(!this.maintain)
      return releaseHandler;

    const releaseObserver = observeRect(element, applySize);

    return () => {
      releaseHandler();
      releaseObserver();
    }
  }

  public get totalSize(){
    const [ top, right, bottom, left ] = this.padding;
    const paddingOnAxis = this.horizontal
      ? left + right : top + bottom;

    return this.scrollArea + paddingOnAxis;
  }

  public get visible(): P[] {
    const source = this.measurements;
    const [ start, end ] = this.visibleRange;
    const items = [];

    if(end - start == 0)
      return [];

    for(let i = start; i <= end; i++)
      items.push(source[i]);

    return items;
  }

  public get visibleOffset(): [number, number] {
    const paddingStart = this.padding[this.horizontal ? 3 : 0];
    const start = this.offset - paddingStart;
    const end = this.offset - paddingStart + this.size[0];

    return [start, end];
  }

  public get visibleRange(): [number, number] {
    this.measurements;
    const range = this.visibleOffset;
    const overscan = this.overscan || 0;
    const beginAt = range[0] - overscan;
    const stopAt = range[1] + overscan;

    if(beginAt == stopAt)
      return [0,0];

    let first = 0;

    while(this.locate(first).end < beginAt)
      first++;

    let last = first;

    while(this.locate(last + 1).start < stopAt)
      last++;

    this.end = last == this.length - 1;

    return [first, last];
  }

  public locate(index: number): P {
    const cache = this.measurements;

    if(index >= this.length)
      return {} as any;

    while(index >= cache.length)
      if(!this.extend())
        return {} as any;

    return cache[index];
  }

  protected position(
    size: [number, number],
    offset: [number, number]){

    const { horizontal, padding } = this;
    let width, height, top, left;

    if(horizontal){
      [height, width] = size;
      [left, top] = offset;
    }
    else {
      [width, height] = size;
      [top, left] = offset;
    }

    top += padding[0];
    left += padding[3];

    return { width, height, left, top } as const;
  }

  protected scrollTo(offset: number){
    const { current } = this.container;

    if(current)
      current[this.scrollKey] = offset;
  }

  public gotoOffset(toOffset: number, opts: any){
    this.scrollTo(
      alignedOffset(
        toOffset,
        this.offset,
        this.size[0],
        opts.align
      )
    );
  }

  protected gotoIndex(index: number, opts: any = {}){
    const align = opts.align || 'auto';
    const target = this.findItem(align, index);

    if(target === undefined)
      return;

    this.scrollTo(
      alignedOffset(
        target,
        this.offset,
        this.size[0],
        align
      )
    );
  }

  protected findItem(align: Alignment, index: number){
    const { offset, length, measurements, size: [ available ] } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    const measurement = measurements[clampedIndex];

    if(!measurement)
      return;

    const { start, end } = measurement;
    const size = end - start;

    if(align == 'auto')
      if(end >= offset + available)
        align = 'end'
      else if(start <= offset)
        align = 'start'
      else
        return;

    return (
      align == 'center' ? start + size / 2 :
      align == 'end' ? end : start
    )
  }
}

export default Core;