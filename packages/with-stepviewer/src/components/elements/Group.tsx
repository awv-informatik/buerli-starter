import React from 'react'
import styled from 'styled-components'
import base from './base'

const Base = styled.div`
  ${base}
  height: auto !important;
  display: flex;
  flex-direction: ${(props: any) => (!props.format || props.format === 'Rows' ? 'row' : 'column')};
`

// TODO: Type of props?
export default function Group({ children, ...props }: { children?: React.ReactNode }) {
  return <Base {...props}>{children}</Base>
}
