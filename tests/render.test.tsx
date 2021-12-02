import { render, waitFor } from '@testing-library/react'
import * as React from 'react'

import { Grid } from '../src'
import { Container, Inner, VirtualRow } from './components'

describe.skip("rendering", () => {
  class Window extends Grid {
    length = 10000;
    overscan = 5;
  }

  const App = () => {
    const {
      container,
      scrollArea,
      visible
    } = Window.use();
  
    return (
      <Container ref={container}>
        <Inner height={scrollArea}>
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
