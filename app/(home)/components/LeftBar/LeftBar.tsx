'use client'

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'

// 侧边栏宽度
const drawerWidth = 64

// 定义按钮项接口
interface LeftBarItem {
    icon: React.ReactElement
    onClick?: () => void
    href?: string
}

interface LeftBarProps {
    isOpen: boolean
    items: LeftBarItem[]
}

export default function LeftBar({ isOpen, items }: LeftBarProps) {

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
            anchor="left"
            open={isOpen}
        >
            <Box sx={{ overflow: 'auto', mt: 8 }}>
                <List>
                    {items.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton 
                                component={item.href ? Link : 'div'}
                                href={item.href}
                                onClick={item.onClick}
                                sx={{
                                    justifyContent: 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon 
                                    sx={{ 
                                        minWidth: 'auto',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    )
}
