import useRect from "./useRect";
import * as React from 'react'
import VC from 'deep-state'

const defaultEstimateSize = (index?: any) => 50;
const useIsomorphicLayoutEffect = React.useLayoutEffect;

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
  estimateSize = defaultEstimateSize;
  parentRef = { current: null as any };
  scrollToFn?: ((offset: any, next?: Function) => void) = undefined; 

  measuredCache: any = {};

  virtualItems = [] as any[];
  scrollOffset = 0;
  outerSize = 0;
  start = 0;
  end = 0;
  isNowMounted = false;

  get measurements(){
    const { estimateSize, measuredCache, paddingStart, size } = this;

    const measurements = [] as {
      index: number
      start: number
      size: number
      end: number
    }[];

    for (let i = 0; i < size; i++){
      const measuredSize = measuredCache[i];
      const start: any = measurements[i - 1] ? measurements[i - 1].end : paddingStart;
      const size = typeof measuredSize === 'number' ? measuredSize : estimateSize(i);
      const end = start + size;

      measurements[i] = { index: i, start, size, end }
    }
    return measurements;
  }

  get sizeKey(){ return this.horizontal ? 'width' : 'height' }
  get scrollKey(){ return this.horizontal ? 'scrollLeft' : 'scrollTop' }

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

  scrollToOffset = (toOffset: number, opts: any) => {
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

  scrollToIndex = (a: any, b: any) => {
    // We do a double request here because of
    // dynamic sizes which can cause offset shift
    // and end up in the wrong spot. Unfortunately,
    // we can't know about those dynamic sizes until
    // we try and render them. So double down!
    this.tryScrollToIndex(a,b)
    requestAnimationFrame(() => {
      this.tryScrollToIndex(a,b)
    })
  }
  
  tryScrollToIndex = (index: number, { align = 'auto', ...rest } = {}) => {
    const { measurements, scrollOffset, outerSize, scrollToOffset, size } = this;
    const measurement = measurements[Math.max(0, Math.min(index, size - 1))]

    if(!measurement)
      return

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

  get totalSize(){
    const { measurements, size, paddingEnd } = this;
    const offset = measurements[size - 1];
    return (offset ? offset.end : 0) + paddingEnd;
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

    const rect = useRect(parentRef);

    this.outerSize = rect ? rect[sizeKey] : 0;

    useIsomorphicLayoutEffect(() => {
      const element = parentRef.current;

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

      return () => {
        element.removeEventListener('scroll', onScroll)
      }
    }, [parentRef.current, scrollKey, size])

    const virtualItems = React.useMemo(() => {
      let { end, start } = this;
      const virtualItems = [];
      end = Math.min(end, measurements.length - 1);

      for (let i = start; i <= end; i++){
        const item = {
          ...measurements[i],
          measureRef: (el: any) => {
            if(!el)
              return;

            const { scrollOffset } = this;
            const { start, size } = item;
            const { [sizeKey]: measuredSize } = el.getBoundingClientRect();

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
    }, [this.start, this.end, measurements, sizeKey, defaultScrollToFn])

    useIsomorphicLayoutEffect(() => {
      if(!this.isNowMounted)
        this.isNowMounted = true
      else if(estimateSize || size)
        this.measuredCache = {};

    }, [estimateSize, size])

    this.assign({
      virtualItems,
    } as any);
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

    while (start > 0 && measurements[start].end >= scrollOffset)
      start -= 1;

    while (end < total - 1 && measurements[end].start <= scrollOffset + outerSize)
      end += 1;

    // Always add at least one overscan item, so focus will work
    this.start = Math.max(start - overscan, 0)
    this.end = Math.min(end + overscan, total - 1)
  }
}