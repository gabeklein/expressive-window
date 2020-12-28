import VC, { def, ref, tuple } from 'react-use-controller';

import { watchForEvent } from './helpers';
import { alignedOffset } from './measure';
import { observeRect } from './rect';

abstract class Virtual<P extends Position> extends VC {
  length = def(0);
  paddingStart = def(0);
  paddingEnd = def(0);
  horizontal = def(false);
  container = ref(this.observeContainer);
  
  end = false;
  size = tuple(0, 0);
  offset = 0;
  cache = {} as { [index: number]: number };

  didReachEnd?(): void;
  uniqueKey?(forIndex: number): string | number;

  protected abstract position(i: number, prev?: P): P;

  constructor(){
    super();

    this.on("length", () => {
      this.cache = {};
    });

    debugger
    if(this.didReachEnd)
      this.on("end", this.toggleEnd);
  }

  private toggleEnd(is: boolean){
    if(is) this.requestUpdate(() => {
      this.didReachEnd!();
    });
  }

  protected get scrollKey(){
    return this.horizontal
      ? 'scrollLeft'
      : 'scrollTop';
  }

  protected get axis(): Axis {
    return this.horizontal
      ? ['width', 'height']
      : ['height', 'width'];
  }

  protected observeContainer(element: HTMLElement){
    const [ x, y ] = this.axis;

    if(!element)
      return;

    const applySize = (rect: DOMRect) => {
      this.size = [rect[x], rect[y]];
    }

    const updateOffset = () => {
      this.offset = element[this.scrollKey];
    }

    const releaseObserver = 
      observeRect(element, applySize);

    const releaseHandler =
      watchForEvent({
        event: 'scroll',
        target: element,
        handler: updateOffset,
        capture: false,
        passive: true,
      });

    applySize(element.getBoundingClientRect());
    updateOffset();

    return () => {
      releaseHandler();
      releaseObserver();
    }
  }

  public get render(): P[] {
    const [ start, end ] = this.visibleRange;
    const rendered = [];

    for(let i = start; i <= end; i++)
      rendered.push(this.measurements[i]);

    return rendered;
  }

  public get totalSize(){
    const { measurements, length, paddingEnd } = this;
    const offset = measurements[length - 1];
    return (offset ? offset.end : 0) + paddingEnd;
  }

  public get itemsVisible(){
    const r = this.visibleRange;
    return r[1] - r[0];
  }

  public get visibleRange(): [number, number] {
    const { measurements, size, offset } = this;
    const total = measurements.length;
    const final = total - 1;

    let start = final;
    let end = 0;

    while(start > 0 && measurements[start].end >= offset)
      start -= 1;

    if(final > 0)
    while(end < final && measurements[end].start <= offset + size[0])
      end += 1;

    this.end = end == final;

    return [ start, end ]
  }

  protected get measurements(){
    const { length } = this;
    const measurements: P[] = [];

    for(let i = 0; i < length; i++){
      const previous = measurements[i - 1];
      measurements[i] = this.position(i, previous);
    }

    return measurements;
  }

  protected scrollTo(offset: number){
    const { current } = this.container;

    if(current)
      current[this.scrollKey] = offset;
  }

  public gotoOffset(toOffset: number, opts: any){
    this.scrollTo(
      alignedOffset(
        toOffset,
        this.offset,
        this.size[0],
        opts.align
      )
    );
  }

  protected gotoIndex(index: number, opts: any = {}){
    const align = opts.align || 'auto';
    const target = this.findItem(align, index);

    if(target === undefined)
      return;

    this.scrollTo(
      alignedOffset(
        target,
        this.offset,
        this.size[0],
        align
      )
    );
  }

  protected findItem(align: Alignment, index: number){
    const { offset, length, measurements, size: [ available ] } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    const measurement = measurements[clampedIndex];

    if(!measurement)
      return;

    const { start, end } = measurement;
    const size = end - start;

    if(align == 'auto')
      if(end >= offset + available)
        align = 'end'
      else if(start <= offset)
        align = 'start'
      else
        return;

    return (
      align == 'center' ? start + size / 2 :
      align == 'end' ? end : start
    )
  }
}

export default Virtual;