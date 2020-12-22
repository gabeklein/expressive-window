import { def, wrap } from 'react-use-controller';
import { WindowContainer } from './window';
import Base from "./control";

interface DynamicItemStats extends ItemStats {
  ref: (element: HTMLElement) => void;
}

abstract class Linear extends Base {
  overscan = def(0);
  Window = wrap(WindowContainer);

  static get Window(){
    return this.wrap(WindowContainer);
  }

  estimateSize(index: number){
    return 50;
  }

  get render(): DynamicItemStats[] {
    return super.render.map((stats, index) => ({
       ref: this.measureRef(index),
       ...stats
    }))
  }

  get visibleRange(): [number, number] {
    let [ start, end ] = super.visibleRange;
    const extra = this.overscan;
    const final = Math.max(0, this.length - 1);

    start = Math.max(start - extra, 0);
    end = Math.min(end + extra, final);

    return [start, end];
  }

  protected measureRef(forIndex: number){
    return (element: HTMLElement | null) => {
      if(!element)
        return;

      const { offset, axis: [ direction ] } = this;
      const { size: current, start: position } = this.measurements[forIndex];
      const { [direction]: measured } = element.getBoundingClientRect();
  
      if(measured === current)
        return;
  
      if(position < offset)
        this.scrollTo(offset + measured - current)
  
      this.cache[forIndex] = measured;
    }
  }
}

export default Linear;