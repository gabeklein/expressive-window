import Core, { Item } from './controller';
import { absolute, limit } from './measure';

export type Sizable =
  | { aspect: number; }
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
        fitItems(remaining, available, rowSize, gap, rotate);

      size = limit(size, 3);

      if(!filled && this.chop)
        break;
      
      let offset = 0;

      items.forEach((item, column) => {
        const index = indexOffset + column;
        const itemWidth = limit(size * getAspectRatio(item, rotate), 3);
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

        offset = limit(offset + itemWidth + gap, 3);
      })
  
      indexOffset += items.length;
      remaining = remaining.slice(items.length);
      totalHeight += Math.round(size + gap);
      currentRow += 1;
    }

    return output;
  }
}

function fitItems<T extends Sizable>(
  source: T[],
  space: number,
  size: number,
  gap: number,
  horizontal: boolean){

  const items: T[] = [];
  let filled = false;

  for(const item of source){
    items.push(item);

    const combinedAR = items.reduce((total, item) => {
      return total + getAspectRatio(item, horizontal);
    }, 0);
    const whiteSpace = (items.length - 1) * gap;
    const totalSize = space - whiteSpace;
    const idealSize = totalSize / combinedAR;

    if(idealSize <= size){
      size = idealSize;
      filled = true;
      break;
    }
  }

  return { items, size, filled };
}

function getAspectRatio(item: Sizable, rotate = false){
  const ratio = "aspect" in item
    ? item.aspect : (item.width / item.height);

  if(rotate)
    return 1 / ratio;
  else
    return ratio;
}