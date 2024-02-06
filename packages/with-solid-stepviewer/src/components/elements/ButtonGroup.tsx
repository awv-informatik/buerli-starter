import Button, { ButtonProps } from 'antd/lib/button'
import React from 'react'
import styled from 'styled-components'
import base from './base'

const Base = styled(Button.Group)`
  ${base}
  display: flex!important;
  padding-left: 2px;
  padding-right: 2px;
  & > button {
    width: unset;
    display: unset;
    margin-left: 0;
    margin-right: 0;
  }
`

export default function ButtonGroup({ children, ...props }: ButtonProps) {
  return <Base {...props}>{children}</Base>
}
