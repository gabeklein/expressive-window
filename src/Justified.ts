import { from } from '@expressive/mvc';
import Core, { Item } from './Core';
import { decimal } from './measure';

export type Sizable =
  | { aspect: number; }
  | { size: [number, number]; }
  | { width: number; height: number; };

export interface Inline extends Item {
  offset: number;
  row: number;
  column: number;
  size: [number, number];
}

export default class Justified extends Core {
  items = [] as Sizable[];
  cache = [] as Inline[];
  rowSize = 150;
  rows = 0;
  gap = 1;
  chop = false;
  horizontal = false;

  readonly length = from(() => this.getLength);

  protected getLength(){
    return this.items.length;
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
        rowSize = decimal(idealSize, 3);
        full = true;
        break;
      }
    }

    if(!full && this.chop){
      return false;
    }

    let offset = 0;
    const row = this.rows;
    const start = this.scrollArea + (row ? padding : 0);
    const end = start + rowSize;

    items.forEach((item, column) => {
      const index = next + column;
      const aspect = this.getItemAspect(item);
      const width = decimal(rowSize * aspect, 3);
      const size = [rowSize, width] as [number, number];
      const style = this.position(size, [start, offset]);
      const key = this.uniqueKey(index);

      offset = decimal(offset + width + padding, 3);

      this.cache.push({
        index, key, row, column,
        offset, start, end, size, style
      });
    });

    this.scrollArea = Math.round(end);
    this.rows += 1;

    return true;
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