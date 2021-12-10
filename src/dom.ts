import { Core } from ".";

export function observeContainer(this: Core, element: HTMLElement){
  if(!element)
    return;

  let scrollOffset = 0;
  let watchSize = this.maintain;

  const { scrollKey } = this;
  const [ x, y ] = this.axis;
  const content = element.firstChild as HTMLDivElement;

  const getSize = () => {
    if(watchSize)
      window.requestAnimationFrame(getSize);

    const outerRect = element.getBoundingClientRect();
    const innerRect = content.getBoundingClientRect();

    scrollOffset = outerRect.top - innerRect.top;

    this.areaX = outerRect[x];
    this.areaY = innerRect[y];
  }

  const getOffset = () => {
    this.offset = element[scrollKey] + scrollOffset;
  }

  getSize();
  getOffset();

  element.addEventListener("scroll", getOffset, {
    capture: false, passive: true
  });

  return () => {
    watchSize = false;
    element.removeEventListener("scroll", getOffset);
  }
}