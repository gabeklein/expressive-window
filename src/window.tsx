import React from "react";
import Control from "./control";

interface ComponentProps {
  index: number;
  style: React.CSSProperties;
  className?: string;
}

interface ContainerProps {
  control: Control;
  component: ItemComponent;
  style?: React.CSSProperties;
  className?: string;
}

type ItemComponent =
  React.FunctionComponent<ComponentProps>;

export function WindowContainer(
  props: ContainerProps, context: Control){

  const { totalSize, container, render, get: control } = context.tap();
  const { component, ...rest } = props;
  const Component = ItemHoc(component, control);

  return (
    <div ref={container} {...rest as any}>
      <div style={{ height: totalSize }}>
        {render.map(Component)}
      </div>
    </div>
  )
}

export function ItemHoc(
  Component: ItemComponent, control: Control){

  return ({ index, key, start }: ItemStats) => (
    <Component
      index={index}
      key={key || index}
      style={{
        top: start,
        position: "absolute",
        width: "100%"
      }} 
    />
  )
}