import VC, { def, ref, tuple } from 'react-use-controller';

import { watchForEvent } from './helpers';
import { alignedOffset } from './measure';
import { observeRect } from './rect';

abstract class Virtual extends VC {
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

  abstract estimateSize(index: number): number;
  abstract didReachEnd?(): void;
  abstract uniqueKey?(forIndex: number): string | number;

  constructor(){
    super();

    this.on("length", () => {
      this.measuredCache = {};
    });

    if(this.didReachEnd)
      this.on("end", async (is) => {
        if(!is) return;
        await this.requestUpdate();
        this.didReachEnd!();
      });
  }

  protected applyContainer(element: HTMLElement){
    const [ x, y ] = this.axis;

    if(!element)
      return;

    const applySize = (rect: DOMRect) => {
      this.windowSize = [rect[x], rect[y]];
    }

    const updateOffset = () => {
      this.windowOffset = element[this.scrollKey];
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

  protected get axis(): Axis {
    return this.horizontal
      ? ['width', 'height']
      : ['height', 'width'];
  }

  public get render(){
    const { overscan, measurements } = this;
    let [ start, end ] = this.visibleRange;
    const rendered = [];

    if(start == end)
      return [];

    start = Math.max(start - overscan, 0);
    end = Math.min(end + overscan, measurements.length - 1);

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
    const { measurements, windowSize, windowOffset } = this;
    const total = measurements.length;
    const final = total - 1;

    let start = final;
    let end = 0;

    while(start > 0 && measurements[start].end >= windowOffset)
      start -= 1;

    while(end < final && measurements[end].start <= windowOffset + windowSize[0])
      end += 1;

    this.end = end == final;

    return [ start, end ]
  }

  protected get measurements(){
    const { length } = this;
    const measurements: ItemStats[] = [];

    for(let i = 0; i < length; i++){
      const previous = measurements[i - 1];
      measurements[i] = this.position(i, previous);
    }

    return measurements;
  }

  protected position(index: number, prev?: ItemStats): ItemStats {
    const { estimateSize, measuredCache, paddingStart } = this;

    const key = this.uniqueKey && this.uniqueKey(index);
    const size = measuredCache[index] || estimateSize(index);
    const start = prev ? prev.end : paddingStart;
    const end = start + size;

    return { index, key, start, size, end };
  }

  protected get scrollKey(){
    return this.horizontal ? 'scrollLeft' : 'scrollTop';
  }

  protected scrollTo(offset: number){
    const { current } = this.containerRef;

    if(current)
      current[this.scrollKey] = offset;
  }

  public scrollToOffset(toOffset: number, opts: any){
    this.scrollTo(
      alignedOffset(
        toOffset,
        this.windowOffset,
        this.windowSize[0],
        opts.align
      )
    );
  }

  public scrollToIndex(index: number, opts?: any){
    this.tryScrollToIndex(index, opts)
    requestAnimationFrame(() => {
      this.tryScrollToIndex(index, opts)
    })
  }

  protected tryScrollToIndex(index: number, opts: any = {}){
    const align = opts.align || 'auto';
    const target = this.findItem(align, index);

    if(target === undefined)
      return;

    this.scrollTo(
      alignedOffset(
        target,
        this.windowOffset,
        this.windowSize[0],
        align
      )
    );
  }

  protected findItem(align: Alignment, index: number){
    const { windowOffset, windowSize, length, measurements } = this;
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    const measurement = measurements[clampedIndex];

    if(!measurement)
      return;

    const { size, start, end } = measurement;

    if(align == 'auto')
      if(end >= windowOffset + windowSize[0])
        align = 'end'
      else if(start <= windowOffset)
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