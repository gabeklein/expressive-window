import VC, { def, ref, tuple, wrap } from 'react-use-controller';

import { watchForEvent } from './helpers';
import { observeRect, Axis } from './rect';
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

  windowSize = tuple(0, 0);
  windowOffset = 0;
  measuredCache = {} as { [index: number]: number };
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
        this.windowSize[0],
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

  protected get axis(){
    const axis = ['width', 'height'];

    if(!this.horizontal)
      axis.reverse();

    return axis as Axis;
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

  protected applySize(rect: DOMRect){
    this.windowSize = this.axis.map(x => rect[x]) as [number, number];
  }

  protected applyContainer(element: HTMLElement){
    if(!element)
      return;

    if(!this.initialRectSet){
      const rect = element.getBoundingClientRect();
      this.applySize(rect);
      this.initialRectSet = true;
    }

    const updateOffset = () => {
      this.windowOffset = element[this.scrollKey];
    }

    const releaseObserver = 
      observeRect(element, rect => this.applySize(rect));

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

    for(let i = start; i <= end; i++){
      const stats = this.measurements[i];
      const getRef = (el: HTMLElement) => {
        if(el) this.renderedSize(i, el);
      }

      rendered.push({ ...stats, ref: getRef })
    }

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
    const { overscan, measurements, windowSize: size, windowOffset } = this;
    const total = measurements.length;
    const final = total - 1;

    let start = final;
    let end = 0;

    while(start > 0 && measurements[start].end >= windowOffset)
      start -= 1;

    while(end < final && measurements[end].start <= windowOffset + size[0])
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
      const size = measuredCache[i] || estimateSize(i);
      const previousItem = measurements[i - 1];
      const start = previousItem ? previousItem.end : paddingStart;
      const end = start + size;

      measurements[i] = { index: i, start, size, end };
    }

    return measurements;
  }

  protected tryScrollToIndex(index: number, opts: any = {}){
    const { windowOffset, length, measurements, windowSize: [ onAxis ] } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    const measurement = measurements[clampedIndex];
    let align = opts.align || 'auto';

    if(!measurement)
      return;

    if(align === 'auto')
      if(measurement.end >= windowOffset + onAxis)
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
      alignedOffset(toOffset, windowOffset, onAxis, align);

    this.scroll(destination);
  }

  protected estimateSize(forIndex: any){
    return 50;
  };

  protected renderedSize(index: number, element: HTMLElement){
    const { windowOffset, axis: [ direction ] } = this;
    const { size: current, start: position } = this.measurements[index];
    const { [direction]: measured } = element.getBoundingClientRect();

    if(measured === current)
      return;

    if(position < windowOffset)
      this.scroll(windowOffset + measured - current)

    this.measuredCache[index] = measured;
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