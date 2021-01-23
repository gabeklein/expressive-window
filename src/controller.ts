import VC, { def, ref, tuple, wrap } from 'react-use-controller';

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

abstract class Core<P extends Item> extends VC {
  container = ref(this.observeContainer);
  size = tuple(0, 0);
  offset = 0;
  overscan = 0;
  speed = 0;

  length = def(0);
  padding = tuple(0,0,0,0);
  horizontal = def(false);
  maintain = true;
  end = false;

  didStop?(offset: number): void;
  didReachEnd?(): void;

  abstract measurements: P[];

  Window = wrap(WindowContainer);

  static get Window(){
    return this.wrap(WindowContainer);
  }

  constructor(){
    super();

    this.normalizePadding()
    this.observeSpeed();

    if(this.didReachEnd)
      this.on($ => $.end, this.toggleEnd);
  }

  private async normalizePadding(){
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
  }

  private toggleEnd(is: boolean){
    if(is) this.requestUpdate(() => {
      this.didReachEnd!();
    });
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

  protected observeSpeed(){
    this.once($ => $.offset, (pos: number) => {
      let interval = setInterval(() => {
        const speed = this.speed =
          (pos - (pos = this.offset)) * -20;
  
        if(!speed && pos >= 0){
          clearInterval(interval);
          if(this.didStop) 
            this.didStop(pos);
          this.observeSpeed();
        }
      }, 50)
    });
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

  public get visible(): P[] {
    const [ start, end ] = this.visibleRange;
    const items = [];

    if(end - start == 0)
      return [];

    for(let i = start; i <= end; i++)
      items.push(this.measurements[i]);

    return items;
  }

  public get totalSize(){
    const [ top, right, bottom, left ] = this.padding;
    const items = this.measurements;
    const last = items[items.length - 1];
    const paddingOnAxis = this.horizontal
      ? left + right : top + bottom;

    return (last ? last.end : 0) + paddingOnAxis;
  }

  public get itemsVisible(){
    const r = this.visibleRange;
    return r[1] - r[0];
  }

  public get visibleOffset(): [number, number] {
    const paddingStart = this.padding[this.horizontal ? 3 : 0];
    const start = this.offset - paddingStart;
    const end = this.offset - paddingStart + this.size[0];

    return [start, end];
  }

  public get visibleRange(): [number, number] {
    let [visibleStart, visibleEnd] = this.visibleOffset;
    const cache = this.measurements;

    let start = cache.length;
    const last = cache.length - 1;

    visibleStart -= this.overscan;
    visibleEnd += this.overscan;

    while(start > 0 && cache[start - 1].end >= visibleStart)
      start -= 1;

    let end = start;

    while(end < last && cache[end + 1] && cache[end + 1].start <= visibleEnd)
      end += 1;

    this.end = end == last;

    return [start, end];
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