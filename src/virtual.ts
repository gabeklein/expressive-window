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
      const previous = measurements[i - 1];
      const key = this.uniqueKey ? this.uniqueKey(i) : i;
      const column = i % this.columns;
  
      const { itemWidth, itemHeight } = this;
      const size = [itemHeight, itemWidth] as [number, number];
      const offset = column * itemWidth;
  
      const start = !previous ? this.paddingStart : column == 0 ? previous.end : previous.start;
      const end = start + itemHeight;
      const style = absolute(
        this.horizontal,
        [itemWidth, itemHeight],
        [start, offset]
      );
  
      measurements.push({
        index: i,
        key,
        start,
        offset,
        end,
        size,
        column,
        style
      });
    }

    return measurements;
  }
}

export default Virtual;