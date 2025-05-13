'use client'

import {
  Box,
  Container,
  Paper,
  Alert,
  Link,
} from '@mui/material'
import Image from 'next/image'
import NextLink from 'next/link'
export default function WelcomePage() {

  return (
    <Container component='main' maxWidth='xs'>
      <Box
        sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Image src='/logo.png' alt='logo' width={100} height={100} />
          <Alert severity="warning">
            包含成人内容，必须满18周岁访问
          </Alert>
          <Link href='/index/albums' component={NextLink} sx={{ mt: 2 }} color='secondary'>
            我已知晓，进入
          </Link>
        </Paper>
      </Box>
    </Container>
  )
}
