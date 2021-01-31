import VC, { ref, tuple, wrap } from 'react-use-controller';

import { alignedOffset, Alignment } from './measure';
import { observeContainer, observeSpeed } from './observer';
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
  container = ref(observeContainer);
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

  abstract gap: number;
  abstract length: number;
  abstract horizontal: boolean;
  abstract extend(): boolean;

  Window = wrap(WindowContainer);

  static get Window(){
    return this.wrap(WindowContainer);
  }

  constructor(){
    super();
    
    observeSpeed(this);

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

    this.on($ => $.size, () => {
      this.measurements = [];
      this.scrollArea = 0;
    })

    if(this.didReachEnd)
      this.on($ => $.end, (is) => {
        if(is) this.didReachEnd!();
      })
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

  public visibleFrame = tuple(0, 0);

  public get visibleOffset(): [number, number] {
    const paddingStart = this.padding[this.horizontal ? 3 : 0];
    const start = this.offset - paddingStart;
    const end = this.offset - paddingStart + this.size[0];

    return [start, end];
  }

  public get visibleRange(): [number, number] {
    const [ start, stop ] = this.visibleFrame;
    const [ top, bottom ] = this.visibleOffset;

    if(!this.visibleRange || !this.size[0])
      return [0,0];

    if(top < start || bottom > stop)
      return this.findRange();

    return this.visibleRange
  }

  public findRange(): [number, number] {
    const {
      measurements: cache,
      visibleRange: current,
      visibleOffset: range,
      overscan = 0,
      gap
    } = this;

    const beginAt = range[0] - overscan;
    const stopAt = range[1] + overscan;
    const frame = [0,0] as [number, number];

    let target: Item | undefined;
    let first = current ? current[0] : 0;

    while(first > 0 && cache[first - 1] && cache[first - 1].end > beginAt)
      first--;

    while((target = this.locate(first)) && target.end <= beginAt)
      first++

    frame[0] = first ? target!.start - gap : -Infinity;

    let last = current ? current[1] : first;

    while(cache[last] && cache[last].start > stopAt)
      last--;

    while((target = this.locate(last + 1)) && target.start <= stopAt)
      last++;

    frame[1] = target ? target.start : Infinity;

    this.visibleFrame = frame;
    this.end = last == this.length - 1;

    if(current[0] == first && current[1] == last)
      return current;

    return [first, last];
  }

  public locate(index: number): P | undefined {
    const cache = this.measurements;

    if(index >= this.length)
      return;

    while(index >= cache.length)
      if(!this.extend())
        return;

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