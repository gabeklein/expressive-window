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
  totalSize = 0;
  scrollOffset = 0;
  outerSize = 0;
  range = { start: 0, end: 0 };
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

  willRender(){
    let {
      defaultScrollToFn,
      estimateSize,
      measurements,
      paddingEnd,
      parentRef,
      range,
      scrollKey,
      size,
      sizeKey
    } = this;

    const rect = useRect(parentRef);
    this.outerSize = rect ? rect[sizeKey] : 0;

    this.totalSize = (measurements[size - 1]?.end || 0) + paddingEnd;

    useIsomorphicLayoutEffect(() => {
      const element = parentRef.current;

      const onScroll = () => {
        if(element){
          this.range = calculateRange(this, this.range);
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
    }, [parentRef.current, scrollKey, size /* required */])

    const virtualItems = React.useMemo(() => {
      const virtualItems = [];
      const end = Math.min(range.end, measurements.length - 1);

      for (let i = range.start; i <= end; i++){
        const measurement = measurements[i]

        const item = {
          ...measurement,
          measureRef: (el: any) => {
            if(!el)
              return;

            const { scrollOffset } = this;
            const { [sizeKey]: measuredSize } = el.getBoundingClientRect();

            if(measuredSize !== item.size){
              if(item.start < scrollOffset)
                defaultScrollToFn(scrollOffset + (measuredSize - item.size))

              this.measuredCache = {
                ...this.measuredCache,
                [i]: measuredSize,
              }
            }
          }
        }

        virtualItems.push(item)
      }

      return virtualItems
    }, [range.start, range.end, measurements, sizeKey, defaultScrollToFn])

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
}

function calculateRange({
  overscan,
  measurements,
  outerSize,
  scrollOffset,
}: any, prevRange: any){
  const total = measurements.length
  let start = total - 1
  while (start > 0 && measurements[start].end >= scrollOffset)
    start -= 1;

  let end = 0

  while (end < total - 1 && measurements[end].start <= scrollOffset + outerSize)
    end += 1;

  // Always add at least one overscan item, so focus will work
  start = Math.max(start - overscan, 0)
  end = Math.min(end + overscan, total - 1)

  if(!prevRange || prevRange.start !== start || prevRange.end !== end)
    return { start, end }

  return prevRange
}

