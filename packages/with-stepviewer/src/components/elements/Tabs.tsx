import { Tabs as TabsImpl } from 'antd'
import type { TabPaneProps, TabsProps } from 'antd'
import React from 'react'

export function Tabs({ ...props }: TabsProps) {
  return <TabsImpl {...props} />
}

// TODO: add iconSrc to props?
export function TabPane({ ...props }: TabPaneProps) {
  return <TabsImpl.TabPane {...props} />
}
