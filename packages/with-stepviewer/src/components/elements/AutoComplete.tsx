import { AutoComplete as AutoCompleteImpl } from 'antd'
import type { AutoCompleteProps } from 'antd'
import React from 'react'
import styled from 'styled-components'
import base from './base'

type AutoCompleteT = typeof AutoCompleteImpl

const Base: AutoCompleteT = styled(AutoCompleteImpl)`
  ${base}
`

export default function AutoComplete({ ...props }: AutoCompleteProps) {
  return <Base {...props} />
}
