import { from } from "@expressive/mvc";
import Core, { Item } from "./Core";

export interface Cell extends Item {
  start: number;
  end: number;
  column: number;
}

class Grid extends Core {
  cache = [] as Cell[];
  columns = 1;
  scrollArea = 0;
  horizontal = false;
  length = 0;

  height = from(this, state => {
    return Math.floor(state.areaY / state.columns);
  });

  extend(){
    const next = this.cache.length;

    if(!this.areaY || next >= this.length)
      return false;

    const { columns, height } = this;
    const percent = 100 / columns;
    const start = next ? this.scrollArea : 0;
    const end = this.scrollArea = start + height;
    
    for(
      let column = 0;
      this.columns > column &&
      this.length > column + next; 
      column++
    ){
      const index = next + column;
      const key = this.uniqueKey(index);
      const width = percent + "%";
      const offset = (column * percent) + "%";
      const style = this.position(
        [width, height], [offset, start]
      );

      this.cache.push({
        index, key, start,
        end, column, style
      })
    }

    return true;
  }
}

export default Grid;