import { NextResponse } from 'next/server'
import { getAlbumById } from '@/lib/album'
import { getSessionUser } from '@/lib/session/getSession'
import prisma from '@/lib/db'
import { z } from 'zod'

const rqschema = z.object({
  id: z.string().transform(str => parseInt(str)),
})
// 获取某个图集
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  const result = rqschema.safeParse(await params)
  if (!result.success) {
    return NextResponse.json({ status: 400 })
  }
  const id = result.data.id
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({ status: 401 })
  }
  const album = await prisma.album.findUnique({
    where: { id },
    select: {
      owner: {
        select: {
          id: true,
          name: true,
        }
      },
      isPrivate: true,
      albumPictures: {
        select: {
          order: true,
          picture: {
            select: {
              id: true,
              title: true,
              tags: true,
              url: true,
              isPrivate: true,
            }
          }
        }
      }
    }
  }
  )
  if (!album) {
    return NextResponse.json({ status: 404 })
  }
  const isOwner = album.owner.id === session.id
  if (album.isPrivate && !isOwner) {
    return NextResponse.json({ status: 403 })
  }
  const albumResponse = {
    owner: album.owner,
    isPrivate: album.isPrivate,
    albumPictures: album.albumPictures.map(ap => ({
      order: ap.order,
      ...ap.picture
    }))
  }
  return NextResponse.json(albumResponse)
}