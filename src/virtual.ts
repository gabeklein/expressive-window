import Core, { Item } from "./controller";

export interface Cell extends Item {
  start: number;
  end: number;
  column: number;
  offset: number;
  size: [number, number];
}

class Virtual extends Core<Cell> {
  columns = 1;
  gap = 0;

  get itemWidth(){
    const whitespace = (this.columns - 1) * this.gap;
    const available = this.size[1] - whitespace;
    return Math.floor(available / this.columns);
  }

  get itemHeight(){
    return this.itemWidth;
  }

  uniqueKey(forIndex: number): string | number {
    return forIndex;
  }

  get measurements(){
    const { length } = this;
    const measurements: Cell[] = [];

    for(let i = 0; i < length; i++){
      const prev = measurements[i - 1];
      const item = this.measure(i, prev);
      measurements.push(item);
    }

    return measurements;
  }

  protected measure(index: number, previous?: Cell){
    const { itemWidth, itemHeight, gap } = this;
    const size = [itemHeight, itemWidth] as [number, number];

    const column = index % this.columns;
    const start = previous
      ? column > 0 ? previous.start : previous.end + gap
      : this.padding[this.horizontal ? 3 : 0];
    const offset = column * (itemWidth + gap);
    const end = start + itemHeight;

    const key = this.uniqueKey(index);
    const style = this.position([itemWidth, itemHeight], [start, offset]);

    return {
      index, key, start, offset, 
      end, size, column, style
    }
  }
}

export default Virtual;