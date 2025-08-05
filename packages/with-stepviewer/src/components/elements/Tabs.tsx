import TabsImpl, { TabsProps, TabPaneProps } from 'antd/lib/tabs'
import React from 'react'

export function Tabs({ ...props }: TabsProps) {
  return <TabsImpl {...props} />
}

// TODO: add iconSrc to props?
export function TabPane({ ...props }: TabPaneProps) {
  return <TabsImpl.TabPane {...props} />
}
