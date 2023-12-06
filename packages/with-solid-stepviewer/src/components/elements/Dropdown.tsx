import DropdownImpl, { DropDownProps } from 'antd/lib/dropdown'
import React from 'react'

export default function Dropdown({ ...props }: DropDownProps) {
  return <DropdownImpl {...props} />
}
