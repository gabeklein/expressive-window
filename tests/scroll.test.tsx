// import { render } from '@testing-library/react'
// import * as React from 'react'

// import { VirtualController } from '../src'
// import { Container, Inner, Row } from './components'

// const sleep = (time = 1000) => new Promise(r => setTimeout(r, time))

it.skip("", () => {})

// it('scrolling utilities should work', async () => {
//   function App() {
//     const parentRef = React.useRef()

//     const rowVirtualizer = VirtualController.using({
//       size: 10000,
//       parentRef,
//       estimateSize: React.useCallback(() => 35, []),
//       overscan: 5,
//     })

//     return (
//       <>
//         <Container ref={parentRef}>
//           <Inner
//             style={{
//               height: `${rowVirtualizer.totalSize}px`,
//             }}
//           >
//             {rowVirtualizer.virtualItems.map(virtualRow => (
//               <Row
//                 key={virtualRow.index}
//                 style={{
//                   height: `${virtualRow.size}px`,
//                   transform: `translateY(${virtualRow.start}px)`,
//                 }}
//               >
//                 Row {virtualRow.index}
//               </Row>
//             ))}
//           </Inner>
//         </Container>
//         <button
//           onClick={() => {
//             rowVirtualizer.scrollToOffset(500)
//           }}
//         >
//           scrollToOffset500
//         </button>
//         <button
//           onClick={() => {
//             rowVirtualizer.scrollToIndex(50)
//           }}
//         >
//           scrollToIndex50
//         </button>
//       </>
//     )
//   }

//   const rendered = render(<App />)

//   await rendered.getByText('Row 1')

//   act(() => {
//     fireEvent.click(rendered.getByText('scrollToOffset500'))
//     fireEvent.scroll(rendered.getByTestId('container'), {
//       target: rendered.getByTestId('container'),
//     })
//     // await sleep()
//   })

//   await rendered.findByText('Row 20')
//   await rendered.findByText('Row 8')

//   act(() => {
//     fireEvent.click(rendered.getByText('scrollToIndex50'))
//     fireEvent.scroll(rendered.getByTestId('container'), {
//       target: rendered.getByTestId('container'),
//     })
//     // await sleep()
//   })

//   await rendered.findByText('Row 62')
//   await rendered.findByText('Row 50')

//   // expect(rendered.getByTestId('container').scrollTop).toEqual(500)
// })

// fireEvent.scroll(scrollContainer, { target: { scrollY: 100 } });