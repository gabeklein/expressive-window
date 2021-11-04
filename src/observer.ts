import type Core from "./controller"
import { ClientRect, getRect, observeRect } from './rect';

export function observeContainer(
  this: Core<any>, element: HTMLElement){

  const [ x, y ] = this.axis;

  if(!element)
    return;

  const updateOffset = () => {
    this.offset = element[this.scrollKey];
  }

  const applySize = (rect: ClientRect) => {
    const [top, right, bottom, left] = this.padding;

    if(this.horizontal)
      rect.height -= top + bottom;
    else
      rect.width -= left + right;

    this.size = [rect[x], rect[y]];
  }

  updateOffset();
  applySize(getRect(element));

  element.addEventListener("scroll", updateOffset, {
    capture: false, passive: true
  });

  const releaseHandler = () => 
    element.removeEventListener("scroll", updateOffset);

  if(!this.maintain)
    return releaseHandler;

  const releaseObserver =
    observeRect(element, applySize);

  return () => {
    releaseHandler();
    releaseObserver();
  }
}