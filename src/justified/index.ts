import VC, { def, ref } from 'react-use-controller';

import { adjusted, debounce, fitItems, Item, Processed } from './util';

export default class Justified<T extends Item = Item> extends VC {
  container = ref(this.handleContainer);
  width = def(0);
  items = [] as T[];
  rowSize = 150;
  gridGap = 1;
  chop = false;

  get height(){
    const { render } = this;

    if(!render.length)
      return 0;

    const lastImage = render[render.length - 1];
    return lastImage.offset[1] + lastImage.size[1];
  }

  private handleContainer(){
    const el = this.container.current!;
    const update = () => this.width = el.offsetWidth;
    const onResize = debounce(update, 300);

    update();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }

  get render(){
    const { items, gridGap, width, rowSize } = this;
  
    let remaining = Array.from(items);
    let output = [] as Processed<T>[];
    let currentRow = 0;
    let totalHeight = 0;
  
    while(remaining.length){
      const { items, height, filled } =
        fitItems(remaining, width, rowSize, gridGap);

      if(!filled && this.chop)
        break;
      
      let currentOffset = 0;
  
      for(const item of items){
        const itemWidth = adjusted(height, item);

        output.push({
          item,
          row: currentRow,
          size: [itemWidth, height],
          offset: [currentOffset, totalHeight]
        });

        currentOffset += itemWidth + gridGap;
      }

      remaining = remaining.slice(items.length);
      totalHeight += height + gridGap;
      currentRow += 1;
    }
  
    return output;
  }
}

