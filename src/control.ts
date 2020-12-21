import VC, { def, ref, wrap } from 'react-use-controller';

import { watchForEvent } from './helpers';
import { observeRect } from './rect';
import { WindowContainer } from './window';

interface ItemStats {
  index: number
  start: number
  size: number
  end: number
}

export default class Virtual extends VC {
  length = def(0);
  overscan = def(0);
  paddingStart = def(0);
  paddingEnd = def(0);
  horizontal = def(false);
  containerRef = ref(this.applyContainer);
  end = false;

  windowSize = 0;
  windowOffset = 0;
  measuredCache: any = {};
  initialRectSet = false;

  Window = wrap(WindowContainer);

  static get Window(){
    return this.wrap(WindowContainer);
  }

  constructor(){
    super();

    this.on("length", this.resetCache);

    if(this.didReachEnd)
      this.on("end", async (is) => {
        if(!is) return;
        await this.requestUpdate();
        this.didReachEnd!();
      });
  }

  didReachEnd?(): void;

  scrollToOffset = (toOffset: number, opts: any) => {
    const destination =
      alignedOffset(
        toOffset,
        this.windowOffset,
        this.windowSize,
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

  protected get sizeKey(){
    return this.horizontal ? 'width' : 'height'
  }
  
  protected get scrollKey(){
    return this.horizontal ? 'scrollLeft' : 'scrollTop'
  }

  protected scroll(offset: number){
    const { current } = this.containerRef;

    if(current)
      current[this.scrollKey] = offset;
  }

  private resetCache(){
    this.measuredCache = {};
  }

  protected applyContainer(element: HTMLElement){
    if(!element)
      return;

    const { sizeKey } = this;

    if(!this.initialRectSet){
      const rect = element.getBoundingClientRect();
      this.windowSize = rect[sizeKey];
      this.initialRectSet = true;
    }

    const updateOffset = () => {
      this.windowOffset = element[this.scrollKey];
    }

    const releaseObserver = 
      observeRect(element, rect => {
        this.windowSize = rect[sizeKey];
      });

    const releaseHandler =
      watchForEvent({
        event: 'scroll',
        handler: updateOffset,
        target: element,
        capture: false,
        passive: true,
      });

    updateOffset();

    return () => {
      releaseHandler();
      releaseObserver();
    }
  }

  public get render(){
    const rendered = [];
    let [ start, end ] = this.visibleRange;

    if(start - end == 0)
      return [];

    for (let i = start; i <= end; i++)
      rendered.push(this.controlledPosition(i));

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
    const {
      overscan,
      measurements,
      windowSize,
      windowOffset
    } = this;

    const total = measurements.length;
    const final = total - 1;

    let start = final;
    let end = 0;

    while(start > 0 && measurements[start].end >= windowOffset)
      start -= 1;

    while(end < final && measurements[end].start <= windowOffset + windowSize)
      end += 1;

    // do i need this
    end = Math.min(end, final);

    this.end = end == final;

    // Always add at least one overscan item, so focus will work
    return [
      Math.max(start - overscan, 0),
      Math.min(end + overscan, total - 1)
    ]
  }

  protected get measurements(){
    const { estimateSize, measuredCache, paddingStart, length } = this;

    const measurements: ItemStats[] = [];

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

  protected tryScrollToIndex(index: number, opts: any = {}){
    const { windowOffset, windowSize, length } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    const measurement = this.measurements[clampedIndex];
    let align = opts.align || 'auto';

    if(!measurement)
      return;

    if(align === 'auto')
      if(measurement.end >= windowOffset + windowSize)
        align = 'end'
      else if(measurement.start <= windowOffset)
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
      alignedOffset(toOffset, windowOffset, windowSize, align);

    this.scroll(destination);
  }

  protected estimateSize(forIndex: any){
    return 50;
  };

  protected controlledPosition(forIndex: number){
    const stats = this.measurements[forIndex];

    const didGetItemRef = (el: HTMLElement) => {
      if(!el)
        return;

      const { windowOffset } = this;
      const { size, start } = stats;
      const frame = el.getBoundingClientRect();
      const measuredSize = frame[this.sizeKey];

      if(measuredSize === size)
        return;

      if(start < windowOffset)
        this.scroll(windowOffset + measuredSize - size)

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