import React from "react";
import Control from "./control";

interface ComponentProps {
  index: number;
  style: React.CSSProperties;
  className?: string;
}

interface ContainerProps {
  component: React.FunctionComponent<ComponentProps>;
  style?: React.CSSProperties;
  className?: string;
}

export function hoc(Type: typeof Control){
  return function WindowComponent(props: ContainerProps){
    return (
      <Type.Provider>
        <WindowContainer {...props}/>
      </Type.Provider>
    )
  }
}

function WindowContainer(props: ContainerProps){
  const { component: Component, className, style = {} } = props;
  const { get, totalSize, containerRef, render } = Control.tap();

  return (
    <div
      ref={containerRef as any} 
      className={className} 
      style={style}>
      <div 
        style={{ height: totalSize }}>
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