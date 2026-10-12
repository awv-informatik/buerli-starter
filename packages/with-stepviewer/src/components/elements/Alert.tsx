import { Alert as AlertImpl } from 'antd'
import type { AlertProps } from 'antd'
import React from 'react'
import styled from 'styled-components'
import base from './base'

const Base = styled(AlertImpl)`
  ${base}
`

export default function Alert({ ...props }: AlertProps) {
  return <Base {...props} />
}
