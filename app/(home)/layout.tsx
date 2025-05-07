'use client'

import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useState } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FormDialog from './components/Dialog/FormDialog'
import HomeIcon from '@mui/icons-material/Home'
import CollectionsIcon from '@mui/icons-material/Collections'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import TopBar from './components/TopBar/TopBar'
import LeftBar from './components/LeftBar/LeftBar'
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

const newPictureFields = [
  {
    name: 'picture',
    label: '图片',
    type: 'image',
    required: true,
    placeholder: '请选择图片'
  },
  {
    name: 'title',
    label: '图片名称',
    type: 'text',
    required: true,
    placeholder: '请输入图片名称',
    validation: {
      pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
      error: '图片名称只能包含中英文、数字、非连续空格和横杠'
    }
  },
  {
    name: 'tags',
    label: '图片标签',
    type: 'text',
    required: true,
    placeholder: '请输入图片标签,用空格分隔',
    validation: {
      pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
      error: '标签只能包含中英文、数字、非连续空格和横杠'
    }
  }
]
const newAlbumFields = [
  {
    name: 'name',
    label: '图集名称',
    type: 'text',
    required: true,
    placeholder: '请输入图集名称',
    validation: {
      pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
      error: '图集名称只能包含中英文、数字、非连续空格和横杠'
    }
  },
  {
    name: 'tags',
    label: '图集标签',
    type: 'text',
    required: true,
    placeholder: '请输入图集标签,用空格分隔',
    validation: {
      pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
      error: '标签只能包含中英文、数字、非连续空格和横杠'
    }
  }
]

  // 顶部导航栏标签配置
  const topBarTabs = [
    {
      label: "图片",
      value: "/index/pictures",
      icon: <HomeIcon />
    },
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
  const [createPictureDialogOpen, setCreatePictureDialogOpen] = useState(false)
  const [createAlbumDialogOpen, setCreateAlbumDialogOpen] = useState(false)

  // 左侧导航栏配置
  const leftBarItems = [
    {
      icon: <HomeIcon />,
      href: "/index/pictures"
    },
    {
      icon: <CloudUploadIcon />,
      onClick: () => setCreatePictureDialogOpen(true)
    },
    {
      icon: <CreateNewFolderIcon />,
      onClick: () => setCreateAlbumDialogOpen(true)
    }
  ]

  const [pictureSubmitResponseError, setPictureSubmitResponseError] = useState<string>('')
  const [albumSubmitResponseError, setAlbumSubmitResponseError] = useState<string>('')
  async function handleNewPictureSubmit(data: any) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('tags', tagsFormater(data.tags).join(','))
    formData.append('image', data.picture)
    const response = await fetch('/api/pictures', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      setPictureSubmitResponseError('上传失败')
    }
    setCreatePictureDialogOpen(false)
  }
  async function handleNewAlbumSubmit(data: any) {
    const response = await fetch('/api/albums', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        tags: tagsFormater(data.tags)
      })
    })

    if (!response.ok) {
      setAlbumSubmitResponseError('上传失败')
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

      {/* 上传图片对话框 */}
      <FormDialog
        title="上传图片"
        onClose={() => setCreatePictureDialogOpen(false)}
        isOpen={createPictureDialogOpen}
        fields={newPictureFields}
        onSubmit={handleNewPictureSubmit}
        onComplete={() => mutate('/api/pictures')}
        externalError={pictureSubmitResponseError}
        />

      {/* 创建图集对话框 */}
      <FormDialog
        title="创建图集"
        onClose={() => setCreateAlbumDialogOpen(false)}
        isOpen={createAlbumDialogOpen}
        fields={newAlbumFields}
        onSubmit={handleNewAlbumSubmit}
        onComplete={() => mutate('/api/albums')}
        externalError={albumSubmitResponseError}
      />
    </Box>
  )
}
