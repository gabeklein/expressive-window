import { get } from '@expressive/mvc';

import Controller from './Controller';

class Fixed extends Controller {
  length = 0;
  itemSize = 40;
  overscan = 0;

  size = get(this, state => (
    state.itemSize * state.length
  ))

  getItem(i: number){
    return {
      key: i,
      index: i,
      offset: i * this.itemSize,
      size: this.itemSize
    };
  }

  getVisibleRange(){
    const {
      offset,
      overscan,
      itemSize,
      length,
      areaX
    } = this;

    if(!areaX)
      return [0,0] as const;

    const begin = offset - overscan;
    const first = Math.max(0, Math.floor(begin / itemSize));
    const rendered = Math.floor((areaX + overscan) / itemSize) + 1;
    const last = Math.min(length - 1, first + rendered);

    return [first, last] as const;
  }
}

export default Fixed;