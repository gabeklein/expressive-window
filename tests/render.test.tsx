import { render } from '@testing-library/react'
import * as React from 'react'

import { useVirtual } from '../src'
import { Container, Inner, Row } from './components'

it('should render', async () => {
  function App() {
    const {
      parentRef,
      totalSize,
      virtualItems
    } = useVirtual({
      size: 10000,
      estimateSize: React.useCallback(() => 35, []),
      overscan: 5,
    })

    return (
      <>
        <Container ref={parentRef}>
          <Inner style={{ height: `${totalSize}px` }}>
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

  const rendered = render(<App />)

  rendered.getByText('Row 1')
})