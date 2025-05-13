'use client'

import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useState } from 'react'
import { FormDialog } from '@/app/_components/dialog'
import HomeIcon from '@mui/icons-material/Home'
import CollectionsIcon from '@mui/icons-material/Collections'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import { TopBar } from '@/app/_components/toolbar'
import { LeftBar } from '@/app/_components/toolbar'
import { tagsFormater } from '@/lib/fetcher/fetchers'
import { mutate } from 'swr'

// 侧边栏宽度
const drawerWidth = 64

// 主内容区域样式
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: `-${drawerWidth}px`,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: 0,
  }),
}))
const newAlbumFields = [
  {
    name: 'name',
    label: '图集名称',
    type: 'text',
    required: true,
    placeholder: '请输入图集名称',
    validation: {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\- ]{1,100}$/,
      error: '图集名称只能包含中英文、数字、空格和横杠，长度在1-100个字符之间'
    },
    maxLength: 100
  },
  {
    name: 'tags',
    label: '图集标签',
    type: 'text',
    required: true,
    placeholder: '请输入图集标签，用空格分隔（1-10个标签，每个标签1-20字符）',
    validation: {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
      error: '标签只能包含中英文、数字、空格和横杠'
    },
    helperText: '输入1-10个标签，每个标签长度在1-20个字符之间'
  }
]

// 顶部导航栏标签配置
const topBarTabs = [
  {
    label: "图集",
    value: "/index/albums",
    icon: <CollectionsIcon />
  }
]

// 导出默认的 HomeLayout 组件
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [leftBarOpen, setLeftBarOpen] = useState(false)
  const [createAlbumDialogOpen, setCreateAlbumDialogOpen] = useState(false)

  // 左侧导航栏配置
  const leftBarItems = [
    {
      icon: <HomeIcon />,
      href: "/index/albums"
    },
    {
      icon: <CreateNewFolderIcon />,
      onClick: () => setCreateAlbumDialogOpen(true)
    }
  ]

  const [albumSubmitResponseError, setAlbumSubmitResponseError] = useState<{ field: string, message: string }[]>([])
  async function handleNewAlbumSubmit(data: any) {
    const response = await fetch('/api/albums', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        tags: tagsFormater(data.tags),
        isPrivate: true
      })
    })
    if (!response.ok) {
      const result = await response.json()
      await setAlbumSubmitResponseError(result.errors)
    }
    else {
      setCreateAlbumDialogOpen(false)
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 顶部导航栏 */}
      <TopBar
        tabs={topBarTabs}
        onLeftMenuItemClick={() => setLeftBarOpen(!leftBarOpen)}
      />

      {/* 左侧导航栏 */}
      <LeftBar
        isOpen={leftBarOpen}
        items={leftBarItems}
      />

      {/* 主内容区域 */}
      <Main open={leftBarOpen}>
        <Box sx={{ mt: 8 }}>
          {children}
        </Box>
      </Main>

      {/* 创建图集对话框 */}
      <FormDialog
        title="创建图集"
        onClose={() => setCreateAlbumDialogOpen(false)}
        isOpen={createAlbumDialogOpen}
        fields={newAlbumFields}
        onSubmit={handleNewAlbumSubmit}
        onComplete={() => {mutate('/api/albums') ;console.log('图集创建成功')}}
        externalError={albumSubmitResponseError}
      />
    </Box>
  )
}
