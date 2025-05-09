'use client'
import { Typography, Box, CircularProgress } from "@mui/material"
import useSWR from 'swr'
import { redirect } from "next/navigation"
import { useState } from 'react'
import { EditPicture } from '@/app/_components/picture'
import { PictureDetailCard } from '@/app/_components/picture'
import { DeletePicture } from '@/app/_components/picture'
import { Picture } from '@/lib/interfaces/interfaces'
import { useParams } from 'next/navigation'
import { useUser } from '@/lib/fetcher/fetchers'
import { usePicture } from '@/lib/fetcher/fetchers'

export default function PicturePage() {
    const params = useParams()
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const { user, isLoading: userLoading, error: userError } = useUser()
    if (!userLoading && !user) {
        redirect('/login')
    }
    const { picture, isLoading, error } = usePicture(Number(params.id))

    if (isLoading) {
        return <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
        }}>
            <CircularProgress />
        </Box>
    }
    if (error) {
        return <Typography color="error" align="center">出错了： {error.message}</Typography>
    }
    if (!picture) {
        return <Typography align="center">图片不存在</Typography>
    }
    if (picture.isPrivate && !userLoading && user && user.id !== picture?.owner.id) {
        return <Typography align="center">你没有权限查看这张图片</Typography>
    }

    return (
        <>
            <PictureDetailCard
                picture={picture}
                onEdit={() => setEditOpen(true)}
                onDelete={() => setDeleteOpen(true)}
            />

            <EditPicture
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                picture={picture}
                onSuccess={() => {
                    setEditOpen(false)
                }}
            />

            <DeletePicture
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                picture={picture}
                onSuccess={() => {
                    setDeleteOpen(false)
                }}
            />
        </>
    )
}