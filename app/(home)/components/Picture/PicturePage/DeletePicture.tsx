'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/app/(home)/components/Dialog/ConfirmDialog'
import { Picture } from '@/lib/interfaces/interfaces'

interface DeletePictureProps {
    isOpen: boolean
    onClose: () => void
    picture: Picture
    onSuccess?: () => void
}

export default function DeletePicture({ isOpen, onClose, picture, onSuccess }: DeletePictureProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const response = await fetch(`/api/my/picturess/${picture.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('删除失败')
            }

            if (onSuccess) {
                onSuccess()
            }
            router.push('/me')
        } catch (error) {
            throw new Error('删除失败')
        } finally {
            setIsDeleting(false)
            onClose()
        }
    }

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={() => !isDeleting && onClose()}
            title="确认删除"
            content="确定要删除这张图片吗？此操作无法撤销。"
            primaryButton={{
                text: isDeleting ? '删除中...' : '删除',
                onClick: handleDelete
            }}
            secondaryButton={{
                text: '取消',
                onClick: onClose
            }}
        />
    )
}
