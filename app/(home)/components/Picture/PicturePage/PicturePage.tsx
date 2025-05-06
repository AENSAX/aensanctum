'use client'
import { Typography, Box, CircularProgress } from "@mui/material"
import useSWR from 'swr'
import { redirect } from "next/navigation"
import { useState } from 'react'
import EditPicture from '@/app/(home)/components/Picture/PicturePage/EditPicture'
import PictureDetailCard from '@/app/(home)/components/Picture/PicturePage/PictureDetailCard'
import DeletePicture from '@/app/(home)/components/Picture/PicturePage/DeletePicture'
import { Picture } from '@/lib/interfaces/interfaces'

interface User {
    id: number
    name: string
    email: string
}

const fetcher = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (!response.ok) {
        throw new Error('Failed to fetch picture')
    }
    return response.json()
}

export default function PicturePage(params: { id: number }) {
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const { data: user, isLoading: userLoading, error: userError } = useSWR<User>('/api/auth/login', fetcher)
    if (!userLoading && !user) {
        redirect('/login')
    }
    const { data: picture, isLoading, error } = useSWR<Picture>(`/api/pictures/${params.id}`, fetcher)

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