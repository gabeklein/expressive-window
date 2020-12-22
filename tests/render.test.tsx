import { render, waitFor } from '@testing-library/react'
import * as React from 'react'

import Virtual from '../src'
import { Container, Inner, VirtualRow } from './components'

describe("rendering", () => {
  class Window extends Virtual {
    length = 10000;
    estimateSize = () => 35;
    overscan = 5;
  }

  const App = () => {
    const {
      container,
      totalSize,
      render
    } = Window.use();
  
    return (
      <Container ref={container}>
        <Inner height={totalSize}>
          {render.map(info =>
            <VirtualRow {...info} />
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
