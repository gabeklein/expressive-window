import Core, { Item } from './controller';
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
    let offset = 0;
    let index = 0;
    let row = 0;
  
    while(source.length > index){
      const remaining = source.slice(index);
      const entries = this.buildRow(remaining, index, offset, row);

      if(!entries.length)
        break;

      output.push(...entries);
      offset = Math.round(entries[0].end + this.gap);
      index += entries.length;
      row += 1;
    }

    return output;
  }

  protected buildRow(
    source: Sizable[],
    current: number,
    start: number,
    row: number){

    const { gap } = this;
    const available = this.size[1];
    const items: Sizable[] = [];
    let height = this.rowSize;
    let full = false;

    for(const item of source){
      items.push(item);

      let totalAspect = 0;

      for(const item of items)
        totalAspect += this.getItemAspect(item);

      const whiteSpace = (items.length - 1) * gap;
      const totalSize = available - whiteSpace;
      const idealSize = totalSize / totalAspect;

      if(idealSize <= height){
        height = decimal(idealSize, 3);
        full = true;
        break;
      }
    }

    if(!full && this.chop)
      return [];

    let offset = 0;

    return items.map((item, column) => {
      const aspect = this.getItemAspect(item);
      const width = decimal(height * aspect, 3);

      const index = current + column;
      const end = start + height + gap;
      const size = [width, height] as [number, number];
      const style = this.position(size, [start, offset]);

      offset = decimal(offset + width + gap, 3);

      return {
        index, key: index, row, column, 
        offset, start, end, size, style
      };
    })
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