import observeRect from '@reach/observe-rect';
import VC, { ref } from 'deep-state';
import { useLayoutEffect, useState, useMemo } from 'react';

export { useVirtual }

function useVirtual(opts: any){
  return VirtualController.using(opts);
}

class VirtualController extends VC {
  size = 0
  overscan = 0
  paddingStart = 0
  paddingEnd = 0
  horizontal = false;
  scrollToFn?: ((offset: any, next?: Function) => void) = undefined; 

  protected measuredCache: any = {};
  protected scrollOffset = 0;
  protected outerSize = 0;
  protected start = 0;
  protected end = 0;
  protected isNowMounted = false;
  protected initialRectSet = false;

  public virtualItems = [] as any[];

  public parentRef = ref(element => {
    if(!element)
      return;

    const observer = observeRect(element, rect => {
      this.outerSize = rect[this.sizeKey];
    });

    observer.observe()
    return () => observer.unobserve()
  });

  public scrollToOffset = (toOffset: number, opts: any) => {
    const { scrollOffset, outerSize } = this;
    let align = opts ? opts.align : 'start'; 

    if(align === 'auto')
      if(toOffset <= scrollOffset)
        align = 'start'
      else if(scrollOffset >= scrollOffset + outerSize)
        align = 'end'
      else 
        align = 'start'

    if(align === 'start')
      this.scrollTo(toOffset)
    else if(align === 'end')
      this.scrollTo(toOffset - outerSize)
    else if(align === 'center')
      this.scrollTo(toOffset - outerSize / 2)
  }

  public scrollToIndex = (index: number, opts?: any) => {
    // We do a double request here because of
    // dynamic sizes which can cause offset shift
    // and end up in the wrong spot. Unfortunately,
    // we can't know about those dynamic sizes until
    // we try and render them. So double down!
    this.tryScrollToIndex(index, opts)
    requestAnimationFrame(() => {
      this.tryScrollToIndex(index, opts)
    })
  }

  public get totalSize(){
    const { measurements, size, paddingEnd } = this;
    const offset = measurements[size - 1];
    return (offset ? offset.end : 0) + paddingEnd;
  }

  public estimateSize(index: any){
    return 50;
  };

  get measurements(){
    const {
      estimateSize,
      measuredCache,
      paddingStart,
      size
    } = this;

    const measurements = [] as {
      index: number
      start: number
      size: number
      end: number
    }[];

    for(let i = 0; i < size; i++){
      const measuredSize = measuredCache[i];
      const start: any = measurements[i - 1] ? measurements[i - 1].end : paddingStart;
      const size = typeof measuredSize === 'number' ? measuredSize : estimateSize(i);
      const end = start + size;

      measurements[i] = { index: i, start, size, end }
    }

    return measurements;
  }

  private get sizeKey(){
    return this.horizontal ? 'width' : 'height'
  }
  
  private get scrollKey(){
    return this.horizontal ? 'scrollLeft' : 'scrollTop'
  }

  defaultScrollToFn = (offset: number) => {
    const { current } = this.parentRef;

    if(current)
      current[this.scrollKey] = offset;
  }

  scrollTo = (offset: number) => {
    const { defaultScrollToFn } = this;
    const resolvedScrollToFn: any = 
      this.scrollToFn || defaultScrollToFn;

    resolvedScrollToFn(offset, defaultScrollToFn);
  }

  tryScrollToIndex = (index: number, opts: any = {}) => {
    const { measurements, scrollOffset, outerSize, scrollToOffset, size } = this;
    const measurement = measurements[Math.max(0, Math.min(index, size - 1))]
    let { align = 'auto', ...rest } = opts;

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

    scrollToOffset(toOffset, { align, ...rest })
  }

  willRender(){
    let {
      defaultScrollToFn,
      estimateSize,
      measurements,
      parentRef,
      scrollKey,
      size,
      sizeKey
    } = this;

    const [ element, setElement ] = useState(parentRef.current);

    useLayoutEffect(() => {
      if(parentRef.current !== element)
        setElement(parentRef.current)
    })

    useLayoutEffect(() => {
      if(!element || this.initialRectSet)
        return;

      const rect = element.getBoundingClientRect();
      this.outerSize = rect[sizeKey];
      this.initialRectSet = true;
    }, [element])

    useLayoutEffect(() => {
      if(!this.isNowMounted)
        this.isNowMounted = true
      else if(estimateSize || size)
        this.measuredCache = {};
    }, [estimateSize, size])

    useLayoutEffect(() => {
      const element = parentRef.current!;

      const onScroll = () => {
        if(element){
          this.calculateRange();
          this.scrollOffset = element[scrollKey];
        }
      }

      // Determine initially visible range
      onScroll();

      element.addEventListener('scroll', onScroll, {
        capture: false,
        passive: true,
      })

      return () =>
        element.removeEventListener('scroll', onScroll)
    }, [parentRef.current, scrollKey, size])

    this.virtualItems = useMemo(
      this.getVirtualItems, [
        this.start, 
        this.end, 
        measurements, 
        sizeKey, 
        defaultScrollToFn
      ]
    )
  }

  getVirtualItems = () => {
    let { end, start, measurements, sizeKey, defaultScrollToFn } = this;
    end = Math.min(end, measurements.length - 1);

    const virtualItems = [];

    for(let i = start; i <= end; i++){
      const item = {
        ...measurements[i],
        measureRef: (element: HTMLElement) => {
          if(!element)
            return;

          const rect = element.getBoundingClientRect();
          const measuredSize = rect[sizeKey];
          const { scrollOffset } = this;
          const { size, start } = item;

          if(measuredSize !== size){
            if(start < scrollOffset)
              defaultScrollToFn(scrollOffset + measuredSize - size)

            this.measuredCache[i] = measuredSize;
          }
        }
      }

      virtualItems.push(item)
    }

    return virtualItems
  }

  calculateRange(){
    const {
      overscan,
      measurements,
      outerSize,
      scrollOffset
    } = this;

    const total = measurements.length;
    let start = total - 1;
    let end = 0;

    while(start > 0 && measurements[start].end >= scrollOffset)
      start -= 1;

    while(end < total - 1 && measurements[end].start <= scrollOffset + outerSize)
      end += 1;

    // Always add at least one overscan item, so focus will work
    this.start = Math.max(start - overscan, 0)
    this.end = Math.min(end + overscan, total - 1)
  }
}