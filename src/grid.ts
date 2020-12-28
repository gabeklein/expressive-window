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

  position(index: number, prev: Cell){
    const key = this.uniqueKey ? this.uniqueKey(index) : index;
    const column = index % this.columns;

    const { itemWidth, itemHeight } = this;
    const size = [itemHeight, itemWidth] as [number, number];
    const offset = column * itemWidth;

    const start = !prev ? this.paddingStart : column == 0 ? prev.end : prev.start;
    const end = start + itemHeight;

    const placement = this.horizontal
      ? { height: itemWidth, width: itemHeight, left: start, top: offset }
      : { width: itemWidth, height: itemHeight, top: start, left: offset };

    const style: CSSProperties = {
      position: "absolute", ...placement
    }

    return {
      key,
      index,
      column,
      size,
      start,
      end,
      offset,
      style
    };
  }
}

export default Grid;