import Core, { Item } from './Variable';

interface Row extends Item {
  ref: (element: HTMLElement) => void;
  size: number;
}

class Dynamic extends Core {
  measurements = {} as { [index: number]: number };
  cache = [] as Row[];
  scrollArea = 0;
  horizontal = false;
  length = 0;
  gap = 0;

  constructor(){
    super();
    this.on("length", () => this.measurements = {});
  }

  extend(){
    const index = this.cache.length;

    if(index >= this.length)
      return;

    const offset = this.scrollArea + this.gap;
    const size = this.measurements[index] || this.estimateSize(index);
    const end = this.scrollArea = offset + size;

    const key = this.uniqueKey ? this.uniqueKey(index) : index;
    const style = this.horizontal ? { left: offset } : { top: offset };
    const ref = this.measureSize(index);

    return [{
      index,
      key,
      offset,
      size,
      end,
      style,
      ref
    }]
  }

  /** Determines initial size to allocate before rendering a list element. */
  estimateSize(index: number){
    return 50;
  }

  protected measureSize(forIndex: number){
    return (element: HTMLElement | null) => {
      if(!element)
        return;

      const direction = this.DOM.sizeX; 
      const { size, offset } = this.cache[forIndex];
      const measured = element.getBoundingClientRect()[direction];
  
      if(measured === size)
        return;
  
      if(offset < this.offset)
        this.scrollTo(this.offset + measured - size)
  
      this.measurements[forIndex] = measured;
    }
  }
}

export default Dynamic;