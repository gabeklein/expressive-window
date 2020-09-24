import { render, waitFor } from '@testing-library/react'
import * as React from 'react'

import Virtual from '../src'
import { Container, Inner, VirtualRow } from './components'

const App = () => {
  const {
    parentRef,
    totalSize,
    virtualItems
  } = Virtual.using({
    size: 10000,
    estimateSize: React.useCallback(() => 35, []),
    overscan: 5,
  })

  return (
    <Container ref={parentRef}>
      <Inner height={totalSize}>
        {virtualItems.map(info =>
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