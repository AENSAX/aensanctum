'use client'

import { Typography, Box, Container, Tabs, Tab, CircularProgress } from '@mui/material'
import { PicturesGrid } from '@/app/_components/picture'
import { AlbumsGrid } from '@/app/_components/album'
import useSWR from 'swr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Picture, Album } from '@/lib/interfaces/interfaces'
import { UserInfoCard } from '@/app/_components/user'
import { useUser } from '@/lib/fetcher/fetchers'
import { usePictures } from '@/lib/fetcher/fetchers'
import { useAlbums } from '@/lib/fetcher/fetchers'

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
  const { user, isLoading: userLoading } = useUser()
  const { pictures, error: picturesError, isLoading: picturesLoading } = usePictures()
  const { albums, error: albumsError, isLoading: albumsLoading } = useAlbums()
  const [tabValue, setTabValue] = useState(0)

  if (userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!user) {
    return <Typography align="center">请先登录</Typography>
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
      <UserInfoCard userInfo={user} />
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
