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

  extend(){
    const index = this.measurements.length;

    if(index >= this.length)
      return false;

    const start = this.scrollArea;
    const size = this.cache[index] || this.estimateSize(index);
    const end = this.scrollArea = start + size;

    this.measurements.push({
      index,
      key: this.uniqueKey ? this.uniqueKey(index) : index,
      start,
      size,
      end,
      style: this.horizontal ? { left: start } : { top: start },
      ref: this.measureSize(index)
    });

    return true;
  }

  estimateSize(index: number){
    return 50;
  }

  protected measureSize(forIndex: number){
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