import { render, waitFor, fireEvent, act } from '@testing-library/react'
import * as React from 'react'

import Virtual from '../src'
import { Container, Inner, VirtualRow } from './components'

const App = () => {
  const {
    parentRef,
    totalSize,
    virtualItems,
    scrollToIndex
  } = Virtual.using({
    size: 1000,
    overscan: 5,
    estimateSize(){
      return 35;
    },
  });

  return (
    <>
      <button 
        data-testid="gotoRow50"
        onClick={() => scrollToIndex(50)}>
        Goto 50
      </button>
      <Container ref={parentRef}>
        <Inner height={totalSize}>
          {virtualItems.map(info =>
            <VirtualRow {...info} />
          )}
        </Inner>
      </Container>
    </>
  )
}

it.skip('should render new rows when scrolled', async () => {
  const rendered = render(<App />);

  await waitFor(() => {
    rendered.getByText('Row 1');
  })

  act(() => {
    const container = rendered.getByTestId("gotoRow50");
    fireEvent.click(container);
  })
})