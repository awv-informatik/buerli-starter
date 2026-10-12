import { Checkbox as CheckboxImpl } from 'antd'
import type { CheckboxProps } from 'antd'
import React from 'react'
import styled from 'styled-components'

const Base = styled(CheckboxImpl)`
  line-height: 25px;
  margin: 1px;
`

export default function Checkbox({ children, ...props }: CheckboxProps) {
  return <Base {...props}>{children}</Base>
}
