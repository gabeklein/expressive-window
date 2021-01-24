import Core, { Item } from "./controller";

interface Row extends Item {
  ref: (element: HTMLElement) => void;
  size: number;
}

class Dynamic extends Core<Row> {
  cache = {} as { [index: number]: number };
  scrollArea = 0;
  horizontal = false;
  length = 0;

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
      const prev = measurements[i - 1];
      const item = this.measure(i, prev);
      measurements.push(item);
    }

    return measurements;
  }

  protected measure(index: number, previous?: Row){
    const size = this.cache[index] || this.estimateSize(index);
    const start = previous ? previous.end : this.padding[1];
    const end = start + size;

    const key = this.uniqueKey ? this.uniqueKey(index) : index;
    const ref = this.measureRef(index);

    const style = this.horizontal
      ? { left: start, height: "100%" }
      : { top: start, width: "100%" };

    return {
      index, key, start, 
      end, size, style, ref
    }
  }

  get visibleRange(): [number, number] {
    let [ start, end ] = super.visibleRange;
    const final = Math.max(0, this.length - 1);

    start = Math.max(start, 0);
    end = Math.min(end, final);

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