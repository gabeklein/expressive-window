export type Item =
  | { aspect: number; }
  | { width: number; height: number; };

export type Processed<T extends Item> = {
  item: T;
  row: number;
  size: [number, number];
  offset: [number, number];
}

export function debounce(cb: Function, wait: number) {
	var timeout: number | undefined;
	return () => {
    const later = () => { timeout = undefined, cb() };
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

export function fitItems<T extends Item>(
  source: T[],
  width: number,
  height: number,
  gap: number){

  const items: T[] = [];
  let filled = false;

  for(const item of source){
    items.push(item);

    const combinedAR = items.reduce(combineAspectRatio, 0);
    const whiteSpace = (items.length - 1) * gap;
    const actualWidth = width - whiteSpace;
    const rowHeight = actualWidth / combinedAR;

    if(rowHeight <= height){
      height = rowHeight;
      filled = true;
      break;
    }
  }

  return { items, height, filled };
}

export function adjusted(height: number, item: Item){
  return "aspect" in item 
    ? height * item.aspect
    : height / item.height * item.width;
}

export function combineAspectRatio(total: number, item: Item){
  return total + (
    "aspect" in item
      ? item.aspect
      : (item.width / item.height)
  )
}