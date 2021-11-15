import Model, { from, ref } from '@expressive/mvc';

import { tuple } from './tuple';

type Alignment = "center" | "start" | "end" | "auto";
type value = string | number;

export interface Item {
  index: number;
  key: value;
  start: number;
  end: number;
  style: {};
}

abstract class Core extends Model {
  container = ref(this.observeContainer);
  horizontal = false;
  overscan = 0;
  maintain = false;

  areaX = 0;
  areaY = 0;

  frame = tuple(0, 0);
  cache: Item[] = [];
  scrollArea = 0;
  offset = 0;
  end = false;

  abstract length: number;
  abstract extend(): boolean;

  get axis(){
    return this.horizontal
      ? ['width', 'height'] as const
      : ['height', 'width'] as const
  }

  get scrollKey(){
    return this.horizontal ? 'scrollLeft' : 'scrollTop';
  }

  readonly visible = from(() => this.getVisible);
  readonly range = from(() => this.getVisibleRange);

  public use(){
    return this.tap();
  }

  protected observeContainer(element: HTMLElement){
    if(!element)
      return;

    let scrollOffset = 0;
    let watchSize = this.maintain;

    const { scrollKey } = this;
    const [ x, y ] = this.axis;
    const content = element.firstChild as HTMLDivElement;

    const getSize = () => {
      if(watchSize)
        window.requestAnimationFrame(getSize);

      const outerRect = element.getBoundingClientRect();
      const innerRect = content.getBoundingClientRect();

      scrollOffset = outerRect.top - innerRect.top;

      this.areaX = outerRect[x];
      this.areaY = innerRect[y];
    }

    const getOffset = () => {
      this.offset = element[scrollKey] + scrollOffset;
    }

    getSize();
    getOffset();
  
    element.addEventListener("scroll", getOffset, {
      capture: false, passive: true
    });

    return () => {
      watchSize = false;
      element.removeEventListener("scroll", getOffset);
    }
  }

  protected getVisible(): this["cache"] {
    const source = this.cache;
    const [ start, end ] = this.range;
    const items = [];

    if(end - start == 0)
      return [];

    for(let i = start; i <= end; i++)
      items.push(source[i]);

    return items;
  }

  protected getVisibleRange(): [number, number] {
    const {
      cache,
      overscan,
      range: current,
      offset: top,
      frame
    } = this;

    const bottom = top + this.areaX;

    if(!current || !this.areaX)
      return [0,0];

    if(bottom <= frame[1] && top >= frame[0])
      return current;

    const beginAt = top - overscan;
    const stopAt = bottom + overscan;

    let target: Item | undefined;
    let first = 0;

    const locate = (index: number) => {
      if(index >= this.length)
        return;
  
      while(index >= cache.length)
        if(!this.extend())
          return;
  
      return cache[index];
    }

    while(first > 0 && cache[first - 1] && cache[first - 1].end > beginAt)
      first--;

    while((target = locate(first)) && target.end <= beginAt)
      first++;

    let last = current[1];

    while(cache[last] && cache[last].start > stopAt)
      last--;

    const start = first ? target!.start : -Infinity;

    while((target = locate(last + 1)) && target.start <= stopAt)
      last++;

    const stop = target ? target.start : Infinity;

    this.frame = [start, stop];
    this.end = last == this.length - 1;

    if(current[0] == first && current[1] == last)
      return current;

    return [first, last];
  }

  protected position(
    size: [value, value],
    offset: [value, value]){

    let width, height, top, left;

    if(this.horizontal){
      [height, width] = size;
      [top, left] = offset;
    }
    else {
      [width, height] = size;
      [left, top] = offset;
    }

    return { width, height, left, top } as const;
  }

  protected scrollTo(offset: number){
    const container = this.container.current;

    if(container)
      container[this.scrollKey] = offset;
  }

  public uniqueKey(forIndex: number): string | number {
    return forIndex;
  }

  public gotoOffset(toOffset: number, opts: any){
    this.scrollTo(
      this.getOffset(toOffset, opts.align)
    );
  }

  protected gotoIndex(index: number, opts: any = {}){
    const align = opts.align || 'auto';
    const target = this.findItem(align, index);

    if(target === undefined)
      return;

    this.scrollTo(
      this.getOffset(target, align)
    );
  }

  protected findItem(align: Alignment, index: number){
    const { offset, length, cache } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    const measurement = cache[clampedIndex];

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

  public getOffset(
    index: number,
    mode: Alignment = "start"){

    const { offset, areaX } = this;

    if(mode === 'auto')
      if(index <= offset)
        mode = 'start'
      else if(offset >= offset + areaX)
        mode = 'end'
      else 
        mode = 'start'
  
    switch(mode){
      case "start":
        return index;
      case "end":
        return index - areaX;
      case "center":
        return index - areaX / 2;
    }
  }
}

export default Core;