'use client'

import PicturePage from '@/app/(home)/components/Picture/PicturePage/PicturePage'
import { useParams } from 'next/navigation'

export default function AlbumPageWrapper() {
    const params = useParams()

    return (
        <PicturePage id={Number(params.id)} />
    )
}
