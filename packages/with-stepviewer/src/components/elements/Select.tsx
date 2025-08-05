import SelectImpl, { SelectProps, RefSelectProps } from 'antd/lib/select'
import React, { forwardRef } from 'react'
import styled from 'styled-components'
import base from './base'

type SelectT = typeof SelectImpl

const Base: SelectT = styled(SelectImpl)`
  ${base}
  .ant-select-selector {
    height: 25px !important;
    padding: 4px 18px 4px 11px !important;
    .ant-select-selection-search {
      height: 15px !important;
      line-height: 15px !important;
      top: 4px !important;
      .ant-select-selection-search-input {
        height: 15px !important;
        line-height: 15px !important;
      }
    }
    .ant-select-selection-item {
      height: 15px !important;
      line-height: 15px !important;
    }
  }
  .ant-select-arrow {
    right: 6px;
  }
`

type Props = { children?: any[] } & SelectProps

// TODO: remove forwardRef
const Select = forwardRef<RefSelectProps, Props>(({ children, ...props }, ref) => {
  return (
    <Base {...props} ref={ref}>
      {children &&
        children.map((child: any) => (
          <SelectImpl.Option key={child} value={child}>
            {child}
          </SelectImpl.Option>
        ))}
    </Base>
  )
})

export default Select
