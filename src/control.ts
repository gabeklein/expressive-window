import VC, { ref } from 'react-use-controller';

import { observeRect } from './rect';
import { watchForEvent } from './helpers';
import { hoc } from './window';

interface RenderedItem {
  index: number
  start: number
  size: number
  end: number
}

export default class Virtual extends VC {
  length = 0;
  overscan = 0;
  paddingStart = 0;
  paddingEnd = 0;
  horizontal = false;
  containerRef = ref(this.attachContainer);

  static get Window(){
    const Component = hoc(this);
    Object.defineProperty(this, "Window", { value: Component })
    return Component;
  };

  constructor(){
    super();
    this.effect(this.resetCache, ["length"]);
  }

  get didReachEnd(){
    return this.end >= this.length - 1;
  }

  get totalSize(){
    const { measurements, length, paddingEnd } = this;
    const offset = measurements[length - 1];
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
    const destination =
      alignedOffset(
        toOffset,
        this.scrollOffset,
        this.outerSize,
        opts.align
      );

    this.scroll(destination);
  }

  scrollToIndex = (index: number, opts?: any) => {
    this.tryScrollToIndex(index, opts)
    requestAnimationFrame(() => {
      this.tryScrollToIndex(index, opts)
    })
  }

  uniqueKey(forIndex: number){
    return forIndex;
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
    const { overscan, measurements, outerSize, containerRef, scrollKey } = this;

    const offset = containerRef.current![scrollKey];
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
    const { estimateSize, measuredCache, paddingStart, length } = this;

    const measurements: RenderedItem[] = [];

    for(let i = 0; i < length; i++){
      const measuredSize = measuredCache[i];
      const size = typeof measuredSize === 'number' ? measuredSize : estimateSize(i);

      const previousItem = measurements[i - 1];
      const start = previousItem ? previousItem.end : paddingStart;
      const end = start + size;

      measurements[i] = { index: i, start, size, end };
    }

    return measurements;
  }

  protected scroll(offset: number){
    const { current } = this.containerRef;

    if(current)
      current[this.scrollKey] = offset;
  }

  protected tryScrollToIndex(index: number, opts: any = {}){
    const { scrollOffset, outerSize, length } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
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
      align === 'center' ?
        measurement.start + measurement.size / 2 :
      align === 'end' ?
        measurement.end :
        measurement.start;
      
    const destination = 
      alignedOffset(toOffset, scrollOffset, outerSize, align);

    this.scroll(destination);
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

type Alignment = "center" | "start" | "end" | "auto";

function alignedOffset(
  next: number,
  current: number,
  maximum: number,
  mode: Alignment = "start"){

  if(mode === 'auto')
    if(next <= current)
      mode = 'start'
    else if(current >= current + maximum)
      mode = 'end'
    else 
      mode = 'start'

  switch(mode){
    case "start":
      return next;
    case "end":
      return next - maximum;
    case "center":
      return next - maximum / 2;
  }
}