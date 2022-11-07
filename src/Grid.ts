import { get } from '@expressive/mvc';

import Controller, { Item } from './Controller';

export interface Cell extends Item {
  row: number;
  column: number;
  offset: number;
}

class Grid extends Controller {
  /** Size of virtual collection */
  length = 0;

  cache = [] as Cell[];

  /** Number of columns to break elements into. */
  columns = 1;

  /**
   * Still render items an amount of pixels above and below viewport.
   * 
   * Useful to prevent unnecessary reloading of elements breifly out of view.
   * 
   * Default: 0;
   * */
  overscan = 0;

  size = get(this, state => (
    state.itemSize * Math.ceil(state.length / this.columns)
  ))

  itemSize = get(this, state => {
    return Math.floor(state.areaY / state.columns);
  });

  getItem(index: number){
    const { columns, itemSize: size } = this;
    const row = Math.floor(index / columns);
    const column = index % columns;
    const offset = row * size;
    const width = 100 / columns;

    return {
      index,
      key: index,
      row,
      column,
      offset,
      size,
      width 
    }
  }

  getVisibleRange(){
    const {
      offset,
      overscan,
      itemSize,
      length,
      areaX,
      columns
    } = this;

    const start = offset - overscan;
    const space = areaX + overscan;
  
    const first = Math.max(0, Math.floor(start / itemSize)) * columns;
    const rendered = (Math.ceil(space / itemSize) + 1) * columns - 1;
    const last = Math.min(length - 1, first + rendered);

    return [first, last] as const;
  }
}

export default Grid;