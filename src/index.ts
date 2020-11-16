import VC, { ref } from 'react-use-controller';

import { observeRect } from './rect';
import { watchForEvent } from './helpers';

export default class VirtualController extends VC {
  size = 0;
  overscan = 0;
  paddingStart = 0;
  paddingEnd = 0;
  horizontal = false;
  parentRef = ref(this.attachContainer);

  constructor(){
    super();
    this.effect(this.resetCache, ["size"]);
  }

  get totalSize(){
    const { measurements, size, paddingEnd } = this;
    const offset = measurements[size - 1];
    return (offset ? offset.end : 0) + paddingEnd;
  }

  get render(){
    const items = [];
    let { start, end, measurements } = this;
    end = Math.min(end, measurements.length - 1);

    for (let i = start; i <= end; i++)
      items.push(this.controlledPosition(i));

    return items;
  }

  scrollToOffset = (toOffset: number, opts: any) => {
    this.tryScrollToOffset(toOffset, opts.align);
  }

  scrollToIndex = (index: number, opts?: any) => {
    this.tryScrollToIndex(index, opts)
    requestAnimationFrame(() => {
      this.tryScrollToIndex(index, opts)
    })
  }

  estimateSize(forIndex: any){
    return 50;
  };

  protected measuredCache: any = {};
  protected scrollOffset = 0;
  protected outerSize = 0;
  protected start = 0;
  protected end = 0;
  protected initialRectSet = false;

  protected get sizeKey(){
    return this.horizontal ? 'width' : 'height'
  }
  
  protected get scrollKey(){
    return this.horizontal ? 'scrollLeft' : 'scrollTop'
  }

  protected resetCache(){
    this.measuredCache = {};
  }

  protected attachContainer(element: HTMLElement){
    if(!element)
      return;

    const { sizeKey, calculateRange } = this;

    if(!this.initialRectSet){
      const rect = element.getBoundingClientRect();
      this.outerSize = rect[sizeKey];
      this.initialRectSet = true;
    }

    const releaseObserver = 
      observeRect(element, rect => {
        this.outerSize = rect[sizeKey];
      });

    const releaseHandler =
      watchForEvent({
        event: 'scroll',
        handler: calculateRange,
        target: element,
        capture: false,
        passive: true,
      });

    calculateRange();

    return () => {
      releaseHandler();
      releaseObserver();
    }
  }

  protected calculateRange = () => {
    const { overscan, measurements, outerSize, parentRef, scrollKey } = this;

    const offset = parentRef.current![scrollKey];
    const total = measurements.length;
    let start = total - 1;
    let end = 0;

    while(start > 0 && measurements[start].end >= offset)
      start -= 1;

    while(end < total - 1 && measurements[end].start <= offset + outerSize)
      end += 1;

    // Always add at least one overscan item, so focus will work
    this.start = Math.max(start - overscan, 0)
    this.end = Math.min(end + overscan, total - 1)
    this.scrollOffset = offset;
  }

  protected get measurements(){
    const { estimateSize, measuredCache, paddingStart, size } = this;

    const measurements = [] as {
      index: number
      start: number
      size: number
      end: number
    }[];

    for(let i = 0; i < size; i++){
      const measuredSize = measuredCache[i];
      const start = measurements[i - 1] ? measurements[i - 1].end : paddingStart;
      const size = typeof measuredSize === 'number' ? measuredSize : estimateSize(i);
      const end = start + size;

      measurements[i] = { index: i, start, size, end }
    }

    return measurements;
  }

  protected scroll(offset: number){
    const { current } = this.parentRef;

    if(current)
      current[this.scrollKey] = offset;
  }

  protected tryScrollToIndex(index: number, opts: any = {}){
    const { scrollOffset, outerSize, size } = this;
    const clampedIndex = Math.max(0, Math.min(index, size - 1));
    const measurement = this.measurements[clampedIndex];
    let align = opts.align || 'auto';

    if(!measurement)
      return;

    if(align === 'auto')
      if(measurement.end >= scrollOffset + outerSize)
        align = 'end'
      else if(measurement.start <= scrollOffset)
        align = 'start'
      else
        return;

    const toOffset =
      align === 'center'
        ? measurement.start + measurement.size / 2
        : align === 'end'
        ? measurement.end
        : measurement.start

    this.tryScrollToOffset(toOffset, align)
  }

  protected tryScrollToOffset(newOffset: number, align = 'start'){
    const { scrollOffset, outerSize } = this;
    let dest = 0;

    if(align === 'auto')
      if(newOffset <= scrollOffset)
        align = 'start'
      else if(scrollOffset >= scrollOffset + outerSize)
        align = 'end'
      else 
        align = 'start'

    if(align === 'start')
      dest = newOffset;
    else if(align === 'end')
      dest = newOffset - outerSize;
    else if(align === 'center')
      dest = newOffset - outerSize / 2;

    this.scroll(dest);
  }

  protected controlledPosition(forIndex: number){
    const stats = this.measurements[forIndex];

    const didGetItemRef = (el: HTMLElement) => {
      if(!el)
        return;

      const frame = el.getBoundingClientRect();
      const measuredSize = frame[this.sizeKey];
      const { scrollOffset } = this;
      const { size, start } = stats;

      if(measuredSize === size)
        return;

      if(start < scrollOffset)
        this.scroll(scrollOffset + measuredSize - size)

      this.measuredCache[forIndex] = measuredSize;
    }

    return {
      measureRef: didGetItemRef,
      ...stats
    }
  }
}