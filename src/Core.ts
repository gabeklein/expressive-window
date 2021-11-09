import Model, { from, ref } from '@expressive/mvc';

import { alignedOffset, Alignment } from './measure';
import { observeScroll } from './observer';
import { tuple } from './tuple';

type One<T> = T extends (infer U)[] ? U : never;

export interface Item {
  index: number;
  key: number | string;
  start: number;
  end: number;
  style: {};
}

abstract class Core extends Model {
  container = ref(this.observeContainer);
  horizontal = false;
  overscan = 0;
  maintain = false;
  gap = 0;

  areaX = 0;
  areaY = 0;

  visibleFrame = tuple(0, 0);
  measurements: Item[] = [];
  scrollArea = 0;
  offset = 0;
  end = false;

  abstract length: number;
  abstract extend(): boolean;

  readonly axis = from(this, state => (
    state.horizontal
      ? ['width', 'height'] as const
      : ['height', 'width'] as const
  ));

  readonly scrollKey = from(this, state => (
    state.horizontal ? 'scrollLeft' : 'scrollTop'
  ));

  readonly visible = from(() => this.getVisible);
  readonly visibleRange = from(() => this.getVisibleRange);
  readonly visibleOffset = from(() => this.getVisibleOffset);

  protected observeContainer(element: HTMLElement){
    if(!element)
      return;

    const [ a, b ] = this.axis;
    const inner = element.firstChild as HTMLElement;
    const release = observeScroll(this, element);

    const resize = () => {
      if(this.maintain)
        window.requestAnimationFrame(resize);

      this.areaX = element.getBoundingClientRect()[a];
      this.areaY = inner.getBoundingClientRect()[b];
    }

    resize();

    return () => {
      this.maintain = false;
      release();
    }
  }

  protected getVisible(): this["measurements"] {
    const source = this.measurements;
    const [ start, end ] = this.visibleRange;
    const items = [];

    if(end - start == 0)
      return [];

    for(let i = start; i <= end; i++)
      items.push(source[i]);

    return items;
  }

  protected getVisibleOffset(): [number, number] {
    return [this.offset, this.offset + this.areaX];
  }

  protected getVisibleRange(): [number, number] {
    const [ start, stop ] = this.visibleFrame;
    const [ top, bottom ] = this.visibleOffset;

    if(!this.visibleRange || !this.areaX)
      return [0,0];

    if(bottom > stop || top < start)
      return this.findRange();

    return this.visibleRange
  }

  public findRange(): [number, number] {
    const {
      measurements: cache,
      visibleRange: current,
      visibleOffset: range,
      overscan,
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

  public locate(index: number){
    const cache = this.measurements;

    if(index >= this.length)
      return;

    while(index >= cache.length)
      if(!this.extend())
        return;

    return cache[index] as One<this["measurements"]>;
  }

  protected position(
    size: [number, number],
    offset: [number, number]){

    let width, height, top, left;

    if(this.horizontal){
      [height, width] = size;
      [left, top] = offset;
    }
    else {
      [width, height] = size;
      [top, left] = offset;
    }

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
        this.areaX,
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
        this.areaX,
        align
      )
    );
  }

  protected findItem(align: Alignment, index: number){
    const { offset, length, measurements } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    const measurement = measurements[clampedIndex];

    if(!measurement)
      return;

    const { start, end } = measurement;
    const range = end - start;

    if(align == 'auto')
      if(end >= offset + this.areaX)
        align = 'end'
      else if(start <= offset)
        align = 'start'
      else
        return;

    return (
      align == 'center' ? start + range / 2 :
      align == 'end' ? end : start
    )
  }
}

export default Core;