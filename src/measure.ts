export type Alignment = 
  | "center" 
  | "start" 
  | "end" 
  | "auto";

export function alignedOffset(
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

export function absolute(
  horizontal: boolean,
  size: [x: number, y: number],
  offset: [x: number, y: number]){

  const [[width, height], [top, left]] = 
    [size, offset].map(a => 
      horizontal ? [...a].reverse() : a
    );

  return {
    position: "absolute",
    width, height,
    left, top
  } as const;
}