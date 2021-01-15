import Core, { Item } from './controller';
import { truncate } from './measure';

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

export default class Justified extends Core<Inline> {
  items = [] as Sizable[];
  rowSize = 150;
  gap = 1;
  chop = false;

  get measurements(){
    if(!this.size[1])
      return [];
  
    const source = this.items;
    let output = [] as Inline[];
    let currectOffset = 0;
    let currentIndex = 0;
    let currentRow = 0;
  
    while(source.length > currentIndex){
      const remaining = source.slice(currentIndex);
      let { items, size, filled } = this.buildRow(remaining);

      if(!filled && this.chop)
        break;
      
      const entries =
        this.generateRow(
          items,
          size,
          currentIndex,
          currectOffset,
          currentRow
        );

      output.push(...entries);
      currentRow += 1;
      currentIndex += items.length;
      currectOffset += Math.round(size + this.gap);
    }

    return output;
  }

  protected generateRow(
    items: Sizable[],
    height: number,
    indexOffset: number,
    start: number,
    row: number){

    const { gap } = this;
    let offset = 0;

    return items.map((item, column) => {
      const aspect = this.getItemAspect(item);
      const width = truncate(height * aspect, 3);
      const size = [width, height] as [number, number];

      const index = indexOffset + column;
      const style = this.position(size, [start, offset]);
      const end = start + height + gap;

      offset = truncate(offset + width + gap, 3);

      return {
        index, key: index, row, column, 
        offset, start, end, size, style
      };
    })
  }

  protected buildRow(source: Sizable[]){
    const space = this.size[1];
    const items: Sizable[] = [];
    let size = this.rowSize;
    let filled = false;

    for(const item of source){
      items.push(item);

      let totalAspect = 0;

      for(const item of items)
        totalAspect += this.getItemAspect(item);

      const whiteSpace = (items.length - 1) * this.gap;
      const totalSize = space - whiteSpace;
      const idealSize = totalSize / totalAspect;

      if(idealSize <= size){
        size = truncate(idealSize, 3);
        filled = true;
        break;
      }
    }

    return { items, size, filled };
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