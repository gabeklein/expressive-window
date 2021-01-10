import Core, { Item } from './controller';
import { absolute, truncate } from './measure';

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
    const { items, gap, size, horizontal } = this;
    const available = size[1];

    if(!available)
      return [];
  
    let remaining = Array.from(items);
    let output = [] as Inline[];
    let currentRow = 0;
    let totalHeight = 0;
    let indexOffset = 0;
  
    while(remaining.length){
      let { items, size, filled } =
        this.buildRow(remaining);

      if(!filled && this.chop)
        break;
      
      let offset = 0;

      items.forEach((item, column) => {
        const index = indexOffset + column;
        const itemWidth = truncate(size * this.getItemAspect(item), 3);
        const start = totalHeight;
        const end = start + size + gap;

        const style = absolute(
          this.horizontal,
          [itemWidth, size],
          [start, offset]
        );

        output.push({
          index,
          key: index,
          row: currentRow,
          column,
          start,
          offset,
          end,
          size: [itemWidth, size],
          style
        });

        offset = truncate(offset + itemWidth + gap, 3);
      })
  
      indexOffset += items.length;
      remaining = remaining.slice(items.length);
      totalHeight += Math.round(size + gap);
      currentRow += 1;
    }

    return output;
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
}