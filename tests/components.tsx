import * as React from 'react'

export const Container: any = React.forwardRef((props, ref) => {
  return (
    <div
      {...props}
      data-testid="container"
      ref={ref as any}
      style={{
        height: `200px`,
        width: `200px`,
        overflow: 'auto',
      }}
    />
  )
})

export const Inner: any = React.forwardRef((props: any, ref: any) => {
  const { style = {}, ...rest } = props as any;

  return (
    <div
      {...rest}
      data-testid="inner"
      ref={ref}
      style={{
        width: '100%',
        position: 'relative',
        ...style,
      }}
    />
  )
})

export const Row: any = React.forwardRef((props, ref) => {
  const { style = {}, ...rest } = props as any;
  
  return (
    <div
      {...rest}
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        ...style,
      }}
    />
  )
})