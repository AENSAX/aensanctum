'use client'

import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
} from '@mui/material'
import Image from 'next/image'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Box
          className="flex flex-col items-center"
          sx={{
            gap: 4,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              position: 'relative',
              mb: 2,
            }}
          >
            <Image
              src="/logo.png"
              alt="AenSanctum Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              AenSanctum
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              是一个包含成人内容的图片分享平台
            </Typography>
            <Alert 
              severity="warning" 
              sx={{ 
                width: '100%',
                mt: 2,
              }}
            >
              本网站包含成人内容，请确保您已年满18岁。
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => router.push('/index/pictures')}
              sx={{ mt: 2 }}
            >
              进入网站
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}
