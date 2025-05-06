'use client'

import AlbumPage from '@/app/(home)/components/Album/AlbumPage/AlbumPage'
import { useParams } from 'next/navigation'

export default function AlbumPageWrapper() {
    const params = useParams()

    return (
        <AlbumPage albumId={Number(params.id)} />
    )
}
