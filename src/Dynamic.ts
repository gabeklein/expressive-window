import Core, { Item } from "./Core";

interface Row extends Item {
  ref: (element: HTMLElement) => void;
  size: number;
}

class Dynamic extends Core {
  cache = {} as { [index: number]: number };
  measurements = [] as Row[];
  scrollArea = 0;
  horizontal = false;
  length = 0;
  gap = 0;

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

    const start = this.scrollArea + this.gap;
    const size = this.cache[index] || this.estimateSize(index);
    const end = this.scrollArea = start + size;

    const key = this.uniqueKey ? this.uniqueKey(index) : index;
    const style = this.horizontal ? { left: start } : { top: start };
    const ref = this.measureSize(index);

    this.measurements.push({
      index, key, start, size, end, style, ref
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

      const [ direction ] = this.axis; 
      const { size, start } = this.measurements[forIndex];
      const measured = element.getBoundingClientRect()[direction];
  
      if(measured === size)
        return;
  
      if(start < this.offset)
        this.scrollTo(this.offset + measured - size)
  
      this.cache[forIndex] = measured;
    }
  }
}

export default Dynamic;