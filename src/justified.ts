import Virtual, { Item } from './base';
import { absolute } from './measure';

export type Sizable =
  | { aspect: number; }
  | { width: number; height: number; };

export interface Inline extends Item {
  offset: number;
  row: number;
  column: number;
  size: [number, number];
}

export default class Justified extends Virtual<Inline> {
  items = [] as Sizable[];
  rowSize = 150;
  gridGap = 1;
  chop = false;

  get measurements(){
    const { items, gridGap, rowSize, size } = this;
    const width = size[1];

    if(!width)
      return [];
  
    let remaining = Array.from(items);
    let output = [] as Inline[];
    let currentRow = 0;
    let totalHeight = 0;
    let indexOffset = 0;
  
    while(remaining.length){
      const { items, height, filled } =
        fitItems(remaining, width, rowSize, gridGap);

      if(!filled && this.chop)
        break;
      
      let offset = 0;

      items.forEach((item, column) => {
        const index = indexOffset + column;
        const itemWidth = adjusted(height, item);
        const start = totalHeight;
        const end = start + height + gridGap;

        const style = absolute(
          this.horizontal,
          [itemWidth, height],
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
          size: [itemWidth, height],
          style
        });

        offset += itemWidth + gridGap;
      })
  
      indexOffset += items.length;
      remaining = remaining.slice(items.length);
      totalHeight += height + gridGap;
      currentRow += 1;
    }

    return output;
  }
}

function fitItems<T extends Sizable>(
  source: T[],
  width: number,
  height: number,
  gap: number){

  const items: T[] = [];
  let filled = false;

  for(const item of source){
    items.push(item);

    const combinedAR = items.reduce(combineAspectRatio, 0);
    const whiteSpace = (items.length - 1) * gap;
    const actualWidth = width - whiteSpace;
    const rowHeight = actualWidth / combinedAR;

    if(rowHeight <= height){
      height = rowHeight;
      filled = true;
      break;
    }
  }

  return { items, height, filled };
}

function adjusted(height: number, item: Sizable){
  return "aspect" in item 
    ? height * item.aspect
    : height / item.height * item.width;
}

function combineAspectRatio(total: number, item: Sizable){
  return total + (
    "aspect" in item
      ? item.aspect
      : (item.width / item.height)
  )
}