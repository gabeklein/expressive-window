import { get } from '@expressive/mvc';

import Core, { Item } from './Variable';

export type Sizable =
  | { aspect: number; }
  | { size: [number, number]; }
  | { width: number; height: number; };

export interface Inline extends Item {
  offset: number;
  pos: number;
  row: number;
  column: number;
  size: number;
  width: number;
}

export default class Justified extends Core {
  items = [] as Sizable[];
  cache = [] as Inline[];

  /** Minimum row-height used to while filling row. */
  rowSize = 150;
  scrollArea = 0;

  /** Number of rows generated so far. */
  rows = 0;
  gap = 1;

  /** Hide final row of elements if not full. */
  chop = false;
  horizontal = false;

  readonly length = get(() => this.getLength);

  protected getLength(){
    return this.items.length;
  }

  getItem(index: number){
    return this.cache[index];
  }

  public extend(){
    const padding = this.gap;
    const next = this.cache.length;
    const queue = this.items.slice(next);

    const items: Sizable[] = [];
    let { rowSize } = this;
    let full = false;

    for(const item of queue){
      items.push(item);

      let totalAspect = 0;

      for(const item of items)
        totalAspect += this.getItemAspect(item);

      const whiteSpace = (items.length - 1) * padding;
      const totalSize = this.areaY - whiteSpace;
      const idealSize = totalSize / totalAspect;

      if(idealSize <= rowSize){
        rowSize = clamp(idealSize, 3);
        full = true;
        break;
      }
    }

    if(!full && this.chop)
      return;

    let offset = 0;
    const row = this.rows;
    const start = this.scrollArea + (row ? padding : 0);
    const insert = [] as Inline[];    

    items.forEach((item, column) => {
      const index = next + column;
      const aspect = this.getItemAspect(item);
      const width = clamp(rowSize * aspect, 3);
      const size = Math.round(rowSize);
      const style = this.position([width, size], [offset, start]);
      const key = this.uniqueKey(index);

      offset = clamp(offset + width + padding, 3);

      insert.push({
        index,
        key,
        row,
        column,
        offset: start,
        pos: offset,
        size,
        width,
        style
      });
    });

    this.scrollArea = start + Math.ceil(rowSize);
    this.rows += 1;

    return insert;
  }

  protected getItemAspect(item: Sizable){
    const ratio =
      "aspect" in item ? item.aspect : 
      "size" in item ? (item.size[0] / item.size[1]) : 
      (item.width / item.height);
  
    if(this.horizontal)
      return 1 / ratio;
    else
      return ratio;
  }
}

function clamp(number: number, decimalPlace = 1){
  const factor = 10 ** decimalPlace;
  return Math.round(number * factor) / factor;
}