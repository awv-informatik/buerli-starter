import React from 'react'
import { Tooltip } from 'antd'
import type { TooltipProps } from 'antd'
export default function Button(props: TooltipProps) {
  return <Tooltip {...props} />
}
