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