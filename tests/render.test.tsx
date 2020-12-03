import { render, waitFor } from '@testing-library/react'
import * as React from 'react'

import Virtual from '../src'
import { Container, Inner, VirtualRow } from './components'

describe("rendering", () => {
  class Window extends Virtual {
    size = 10000;
    estimateSize = () => 35;
    overscan = 5;
  }

  const App = () => {
    const {
      containerRef,
      totalSize,
      render
    } = Window.use();
  
    return (
      <Container ref={containerRef}>
        <Inner height={totalSize}>
          {render.map(info =>
            <VirtualRow key={info.index} {...info} />
          )}
        </Inner>
      </Container>
    )
  }
  
  it('should render', async () => {
    const rendered = render(<App />);
  
    await waitFor(() => {
      rendered.getByText('Row 1');
    })
  })
})
