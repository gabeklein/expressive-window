import { Provider } from '@expressive/mvc';
import React, { CSSProperties, FC, ReactNode, useMemo } from 'react';

import Controller from './Controller';

namespace Window {
  export interface Item {
    index: number;
    offset: number;
    size: number;
  }

  interface ContainerProps {
    for: { use(): Controller };
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
  }

  type RenderFunction =
    (info: Item, index: number) => ReactNode;

  export type Props =
    | (ContainerProps & { component: FC<Item> })
    | (ContainerProps & { render: RenderFunction })
}

function Window(props: Window.Props){
  const {
    is: control,
    container,
    slice,
    size: scrollArea,
    DOM
  } = props.for.use();

  const renderRow = useMemo(() => (
    "component" in props
      ? (p: any) => <props.component context={control} {...p} />
      : props.render
  ), []);

  return (
    <Provider for={control}>
      <div ref={container} style={props.style} className={props.className}>
        <div style={{ position: "relative", [DOM.sizeX]: scrollArea }}>
          {props.children}
          {slice.map(renderRow)}
        </div>
      </div>
    </Provider>
  )
}

export default Window;