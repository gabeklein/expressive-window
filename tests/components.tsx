import * as React from 'react';

const Transparent = React.forwardRef;

export const Container: any =
  Transparent((props: any, ref) => {
    return (
      <div
        { ...props }
        data-testid="container"
        ref={ref as any}
        style={{
          height: `200px`,
          width: `200px`,
          overflow: 'auto',
          ...props.style
        }}
      />
    )
  })

export const Inner: any =
  Transparent((props: any, ref: any) => {
    return (
      <div
        { ...props }
        data-testid="inner"
        ref={ref}
        style={{
          width: '100%',
          position: 'relative',
          height: `${props.height}px`
        }}
      />
    )
  })

export const VirtualRow: any = 
  Transparent((props: any, ref: any) => {
    const { index, size, start } = props;

    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${size}px`,
          transform: `translateY(${start}px)`,
        }}>
        Row {index}
      </div>
    )
  })