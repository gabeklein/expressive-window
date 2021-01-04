import { CSSProperties } from 'react';
import { def } from 'react-use-controller';
import Core, { Item } from "./controller";

interface Row extends Item {
  ref: (element: HTMLElement) => void;
  size: number;
}

class Dynamic extends Core<Row> {
  overscan = def(0);
  cache = {} as { [index: number]: number };

  constructor(){
    super();
    this.on($ => $.length, () => this.cache = {});
  }

  uniqueKey(index: number){
    return index;
  }

  estimateSize(index: number){
    return 50;
  }

  get measurements(){
    const { length } = this;
    const measurements: Row[] = [];

    for(let i = 0; i < length; i++){
      const { estimateSize, cache, paddingStart, horizontal } = this;
      const previous = measurements[i - 1];
  
      const size = cache[i] || estimateSize(i);
      const start = previous ? previous.end : paddingStart;
      const end = start + size;
  
      const key = this.uniqueKey ? this.uniqueKey(i) : i;
      const ref = this.measureRef(i);
  
      const placement = horizontal
        ? { left: start, height: "100%" }
        : { top: start, width: "100%" };
  
      const style: CSSProperties = {
        position: "absolute", ...placement
      };
  
      measurements.push({
        index: i,
        key,
        start,
        end,
        size,
        ref,
        style
      });
    }

    return measurements;
  }

  get visibleRange(): [number, number] {
    let [ start, end ] = super.visibleRange;
    const extra = this.overscan;
    const final = Math.max(0, this.length - 1);

    start = Math.max(start - extra, 0);
    end = Math.min(end + extra, final);

    return [start, end];
  }

  protected measureRef(forIndex: number){
    return (element: HTMLElement | null) => {
      if(!element)
        return;

      const { offset, axis: [ direction ] } = this;
      const { size: current, start: position } = this.measurements[forIndex];
      const { [direction]: measured } = element.getBoundingClientRect();
  
      if(measured === current)
        return;
  
      if(position < offset)
        this.scrollTo(offset + measured - current)
  
      this.cache[forIndex] = measured;
    }
  }
}

export default Dynamic;