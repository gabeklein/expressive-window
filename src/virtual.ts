import Core, { Item } from "./controller";
import { absolute } from "./measure";

export interface Cell extends Item {
  start: number;
  end: number;
  column: number;
  offset: number;
  size: [number, number];
}

class Virtual extends Core<Cell> {
  columns = 1;

  get itemWidth(){
    return Math.floor(this.size[1] / this.columns);
  }

  get itemHeight(){
    return this.itemWidth;
  }

  uniqueKey?(forIndex: number): string | number;

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
    const { itemWidth, itemHeight } = this;
    const key = this.uniqueKey ? this.uniqueKey(index) : index;
    const column = index % this.columns;

    const size = [itemHeight, itemWidth] as [number, number];
    const offset = column * itemWidth;
    const start =
      !previous ? this.padding[1] : 
      column == 0 ? previous.end : 
      previous.start;
    const end = start + itemHeight;
    const style = absolute(
      this.horizontal,
      [itemWidth, itemHeight],
      [start, offset]
    );

    return {
      index, key, start, offset, 
      end, size, column, style
    }
  }
}

export default Virtual;