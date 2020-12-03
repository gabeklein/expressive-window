import React from "react";
import Control from "./control";

interface ComponentProps {
  index: number;
  style: React.CSSProperties;
  className?: string;
}

interface ContainerProps {
  control: Control;
  component: React.FunctionComponent<ComponentProps>;
  style?: React.CSSProperties;
  className?: string;
}

export function WindowContainer(props: ContainerProps, context: Control){
  const { get, totalSize, containerRef, render } = context.tap();
  const { component: Component, ...rest } = props;

  return (
    <div ref={containerRef as any} {...rest as any}>
      <div style={{ height: totalSize }}>
        {render.map(x => (
          <Component
            index={x.index}
            key={get.uniqueKey(x.index)}
            style={{
              top: x.start,
              position: "absolute",
              width: "100%"
            }} 
          />
        ))}
      </div>
    </div>
  )
}