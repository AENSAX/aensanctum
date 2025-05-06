'use client'

import { Typography, Box, Container, Tabs, Tab, CircularProgress } from '@mui/material'
import PicturesGrid from '@/app/(home)/components/Picture/PictureGrid/PicturesGrid'
import AlbumsGrid from '@/app/(home)/components/Album/AlbumGrid/AlbumsGrid'
import useSWR from 'swr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Picture, Album } from '@/lib/interfaces/interfaces'
import UserInfoCard from './components/UserInfoCard'

interface User {
  id: string
  name: string
  email: string
}

const fetcher = async (url: string) => {
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!res.ok) {
        throw new Error('获取数据失败')
    }
    return res.json()
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default function MePage() {
  const router = useRouter()
  const { data: userInfo, isLoading: userLoading } = useSWR<User>('/api/auth/login', fetcher)
  const { data: pictures, error: picturesError, isLoading: picturesLoading } = useSWR<Picture[]>('/api/my/pictures', fetcher)
  const { data: albums, error: albumsError, isLoading: albumsLoading } = useSWR<Album[]>('/api/my/albums', fetcher)
  const [tabValue, setTabValue] = useState(0)

  if (userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleImageClick = (picture: Picture) => {
    router.push(`/pictures/${picture.id}`)
  }

  const handleAlbumClick = (album: Album) => {
    router.push(`/albums/${album.id}`)
  }

  return (
    <Container maxWidth="xl">
      <UserInfoCard userInfo={userInfo} />
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                color: 'text.primary',
                '&.Mui-selected': {
                },
              },
            }}
          >
            <Tab label="我的图片" />
            <Tab label="我的图集" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {picturesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
            </Box>
          ) : picturesError ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography color="error">{picturesError.message}</Typography>
            </Box>
          ) : pictures?.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography>你还没有上传任何图片。</Typography>
            </Box>
          ) : (
            <PicturesGrid pictures={pictures || []} onImageClick={handleImageClick}/>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {albumsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
            </Box>
          ) : albumsError ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography color="error">{albumsError.message}</Typography>
            </Box>
          ) : albums?.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography>你还没有创建任何图集。</Typography>
            </Box>
          ) : (
            <AlbumsGrid albums={albums || []} onAlbumClick={handleAlbumClick}/>
          )}
        </TabPanel>
      </Box>
    </Container>
  )
}
