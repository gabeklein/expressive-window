import { CSSProperties } from "react";
import Virtual, { Item } from "./base";

export interface Cell extends Item {
  start: number;
  end: number;
  column: number;
  offset: number;
  size: [number, number];
}

class Grid extends Virtual<Cell> {
  columns = 3;

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
  
      const placement = this.horizontal
        ? { height: itemWidth, width: itemHeight, left: start, top: offset }
        : { width: itemWidth, height: itemHeight, top: start, left: offset };
  
      const style: CSSProperties = {
        position: "absolute", ...placement
      }
  
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

export default Grid;