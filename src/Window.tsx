import { Provider } from '@expressive/mvc';
import React, { CSSProperties, FC, ReactNode, useMemo } from 'react';

import Control from './Core';

interface ComponentProps {
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
  (info: ComponentProps, index: number) => ReactNode;

type WindowProps =
  | (ContainerProps & { component: FC<ComponentProps> })
  | (ContainerProps & { render: RenderFunction })

export default function Window(props: WindowProps){
  const {
    get: controller,
    axis: [ direction ],
    scrollArea,
    container,
    visible,
  } = (props.for as any).use();

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