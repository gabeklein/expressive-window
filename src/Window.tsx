import Model, { Provider } from '@expressive/mvc';
import React, { CSSProperties, FC, ReactNode, useMemo } from 'react';

import Control from './Core';

namespace Window {
  export interface Item {
    index: number;
    offset: number;
    size: number;
  }

  export interface Compat extends Model {
    axis?: readonly ["width", "height"] | readonly ["height", "width"];
    scrollArea: number;
    container: Model.Ref<HTMLElement>;
    visible: Item[];
  }

  interface RowProps {
    index: number;
    style: CSSProperties;
  }

  interface ContainerProps {
    for: typeof Control | Control;
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
  }

  type RenderFunction =
    (info: RowProps, index: number) => ReactNode;

  export type Props =
    | (ContainerProps & { component: FC<RowProps> })
    | (ContainerProps & { render: RenderFunction })
}

function Window(props: Window.Props){
  const {
    get: controller,
    axis,
    scrollArea,
    container,
    visible,
  } = (props.for as any).use();

  const direction = axis ? axis[0] : "height";

  const renderRow = useMemo(() => (
    "component" in props
      ? (p: any) => <props.component context={controller} {...p} />
      : props.render
  ), []);

  return (
    <Provider of={controller}>
      <div ref={container} style={props.style} className={props.className}>
        <div style={{ position: "relative", [direction]: scrollArea }}>
          {props.children}
          {visible.map(renderRow)}
        </div>
      </div>
    </Provider>
  )
}

export default Window;