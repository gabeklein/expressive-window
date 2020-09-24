import { render, waitFor, fireEvent, act } from '@testing-library/react'
import * as React from 'react'

import { useVirtual } from '../src'
import { Container, Inner, Row } from './components'

const App = () => {
  const {
    parentRef,
    totalSize,
    virtualItems,
    scrollToIndex
  } = useVirtual({
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
        onClick={() => {
          scrollToIndex(50)
        }}>
        Goto 50
      </button>
      <Container
        ref={parentRef}>
        <Inner
          style={{ height: `${totalSize}px` }}>
          {virtualItems.map(row => (
            <Row
              key={row.index}
              style={{
                height: `${row.size}px`,
                transform: `translateY(${row.start}px)`,
              }}>
              Row {row.index}
            </Row>
          ))}
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