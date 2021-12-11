import Model, { from, ref } from "@expressive/mvc";
import { observeContainer } from "./dom";
import Window from "./Window";

class Fixed extends Model implements Window.Compat {
  container = ref<HTMLElement, this>(observeContainer);
  visible = from(() => this.getVisible);
  range = from(() => this.getVisibleRange);
  scrollArea = from(this, state => {
    return state.itemSize * state.length;
  })

  areaX = 0;
  areaY = 0;
  offset = 0;
  itemSize = 40;
  overscan = 0;
  length = 0;

  protected getVisible(){
    const [ start, end ] = this.range;
    const items = [];

    for(let i = start; i <= end; i++)
      items.push({
        index: i,
        offset: i * this.itemSize,
        size: this.itemSize
      });

    return items;
  }

  protected getVisibleRange(): [number, number] {
    const { offset, overscan, itemSize, length, areaX } = this;

    const begin = offset - overscan;
    const first = Math.max(0, Math.floor(begin / itemSize));
    const rendered = Math.floor((areaX + overscan) / itemSize) + 1;
    const last = Math.min(length - 1, first + rendered);

    return [first, last];
  }
}

export default Fixed;