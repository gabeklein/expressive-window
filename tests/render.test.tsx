import { render, waitFor } from '@testing-library/react'
import * as React from 'react'

import { Virtual } from '../src'
import { Container, Inner, VirtualRow } from './components'

describe.skip("rendering", () => {
  class Window extends Virtual {
    length = 10000;
    overscan = 5;
  }

  const App = () => {
    const {
      container,
      totalSize,
      visible
    } = Window.use();
  
    return (
      <Container ref={container}>
        <Inner height={totalSize}>
          {visible.map(info =>
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
