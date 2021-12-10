interface Controller {
  maintain?: boolean;
  horizontal?: boolean;
  areaX: number;
  areaY: number;
  offset: number;
}

export function observeContainer(
  this: Controller,
  element: HTMLElement){

  if(!element)
    return;

  let { maintain } = this;
  let scrollOffset = 0;

  const direction = this.horizontal
    ? "scrollLeft"
    : "scrollTop";

  const [ x, y ] = this.horizontal
    ? ['width', 'height'] as const
    : ['height', 'width'] as const;

  const content = element.firstChild as HTMLDivElement;

  const getSize = () => {
    if(maintain)
      window.requestAnimationFrame(getSize);

    const outerRect = element.getBoundingClientRect();
    const innerRect = content.getBoundingClientRect();

    scrollOffset = outerRect.top - innerRect.top;

    this.areaX = outerRect[x];
    this.areaY = innerRect[y];
  }

  const getOffset = () => {
    this.offset = element[direction] + scrollOffset;
  }

  getSize();
  getOffset();

  element.addEventListener("scroll", getOffset, {
    capture: false, passive: true
  });

  return () => {
    maintain = false;
    element.removeEventListener("scroll", getOffset);
  }
}