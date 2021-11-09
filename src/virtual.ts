import { from } from "@expressive/mvc";
import Core, { Item } from "./Core";

export interface Cell extends Item {
  start: number;
  end: number;
  column: number;
  offset: number;
  size: [number, number];
}

class Virtual extends Core {
  measurements = [] as Cell[];
  columns = 1;
  gap = 0;
  scrollArea = 0;
  horizontal = false;

  readonly length = from(() => this.getLength);
  readonly itemWidth = from(() => this.getItemWidth);
  readonly itemHeight = from(() => this.getItemHeight);

  public getLength(){
    return 0;
  }

  private getItemWidth(){
    const whitespace = (this.columns - 1) * this.gap;
    const available = this.size[1] - whitespace;
    return Math.floor(available / this.columns);
  }

  private getItemHeight(){
    return this.itemWidth;
  }

  uniqueKey(forIndex: number): string | number {
    return forIndex;
  }

  extend(){
    const next = this.measurements.length;

    if(!this.size[1] || next >= this.length)
      return false;

    const { itemWidth, itemHeight, gap } = this;
    const start = next ? this.scrollArea + gap : 0;
    const size = [itemHeight, itemWidth] as [number, number];
    const end = this.scrollArea = start + itemHeight;
    
    for(
      let i = 0;
      this.columns > i &&
      this.length > i + next; 
      i++
    ){
      const index = next + i;
      const offset = i * (itemWidth + gap);
      const key = this.uniqueKey(index);
      const style = this.position([itemWidth, itemHeight], [start, offset]);

      this.measurements.push({
        index, key, start, offset, 
        end, size, column: i, style
      })
    }

    return true;
  }
}

export default Virtual;