import { wrap } from 'react-use-controller';
import { WindowContainer } from './window';
import Base from "./control";

interface DynamicItemStats extends ItemStats {
  ref: (element: HTMLElement) => void;
}

abstract class Linear extends Base {
  Window = wrap(WindowContainer);

  static get Window(){
    return this.wrap(WindowContainer);
  }

  estimateSize(index: number){
    return 50;
  };

  protected position(
    index: number, prev?: ItemStats): DynamicItemStats {

    const stats = super.position(index, prev);
    const ref = this.measureRef(index);

    return { ...stats, ref };
  }

  protected measureRef(forIndex: number){
    return (element: HTMLElement) => {
      const { windowOffset, axis: [ direction ] } = this;
      const { size: current, start: position } = this.measurements[forIndex];
      const { [direction]: measured } = element.getBoundingClientRect();
  
      if(measured === current)
        return;
  
      if(position < windowOffset)
        this.scrollTo(windowOffset + measured - current)
  
      this.measuredCache[forIndex] = measured;
    }
  }
}

export default Linear;