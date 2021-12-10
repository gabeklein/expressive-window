import Model, { from, ref } from '@expressive/mvc';
import { observeContainer } from './dom';

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
  container = ref(observeContainer);
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
  abstract extend(): undefined | Item[];

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

  protected getVisible(): this["cache"] {
    const {
      cache,
      range: [ start, end ]
    } = this;

    if(end - start == 0)
      return [];

    const items = [];

    for(let i = start; i <= end; i++)
      items.push(cache[i]);

    return items;
  }

  protected getVisibleRange(): [number, number] {
    const {
      range,
      cache,
      overscan,
      offset,
      frame
    } = this;

    const bottom = offset + this.areaX;

    if(!range || !this.areaX)
      return [0,0];

    if(bottom <= frame[1] && offset >= frame[0])
      return range;

    const beginAt = offset - overscan;
    const stopAt = bottom + overscan;

    let target: Item | undefined;
    let first = 0;

    while(first > 0 && cache[first - 1] && cache[first - 1].end > beginAt)
      first--;

    while((target = this.locate(first)) && target.end <= beginAt)
      first++;

    let last = range[1];

    while(cache[last] && cache[last].start > stopAt)
      last--;

    const start = first ? target!.start : -Infinity;

    while((target = this.locate(last + 1)) && target.start <= stopAt)
      last++;

    const stop = target ? target.start : Infinity;

    this.frame = [start, stop];
    this.end = last == this.length - 1;

    if(range[0] == first && range[1] == last)
      return range;

    return [first, last];
  }

  protected locate(index: number){
    const { cache } = this;

    if(index >= this.length)
      return;

    while(index >= cache.length){
      const insert = this.extend();

      if(!insert || !insert.length)
        return;

      let end = this.scrollArea;
      
      for(const entry of insert){
        cache.push(entry);
        end = Math.max(end, entry.end);
      }

      this.scrollArea = end;
    }
    
    return cache[index];
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