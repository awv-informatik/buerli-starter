import { Dropdown as DropdownImpl } from 'antd'
import type { DropDownProps } from 'antd'
import React from 'react'

export default function Dropdown({ ...props }: DropDownProps) {
  return <DropdownImpl {...props} />
}
