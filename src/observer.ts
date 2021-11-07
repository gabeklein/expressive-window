import type Core from "./Core"

export function observeScroll(
  on: Core<any>, element: HTMLElement){

  const updateOffset = () => {
    on.offset = element[on.scrollKey];
  }

  element.addEventListener("scroll", updateOffset, {
    capture: false, passive: true
  });

  updateOffset();

  return () => {
    element.removeEventListener("scroll", updateOffset);
  }
}