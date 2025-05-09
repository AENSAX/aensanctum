import { NextResponse } from 'next/server'
import { getAllPictures, createPicture } from '@/lib/picture'
import { getSessionUser } from '@/lib/session/getSession'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// 初始化 S3 客户端
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

// 上传图片
export async function POST(request: Request) {
  try {
    const session = await getSessionUser()

    const formData = await request.formData()
    const title = formData.get('title') as string
    const tags = (formData.get('tags') as string).split(',')
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({
        error: {
          message: '文件为空',
          code: 'EMPTY_FILE'
        }
      }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: {
          message: '不支持的文件类型，仅支持JPG、PNG、GIF和WebP格式',
          code: 'UNSUPPORTED_FILE_TYPE'
        }
      }, { status: 400 })
    }

    // 生成唯一的文件名
    const fileExtension = file.name.slice(file.name.lastIndexOf('.'))
    const uniqueFileName = `${uuidv4()}${fileExtension}`
    const key = `images/${uniqueFileName}`

    // 将文件转换为 Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 上传到 R2
    await s3.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))

    // 生成访问 URL
    const url = `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${key}`

    // 创建数据库记录
    const picture = await createPicture(title, tags, session.id, url)
    return NextResponse.json(picture)
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({
        error: {
          message: '未登录',
          code: 'UNAUTHORIZED'
        }
      }, { status: 401 })
    }
    return NextResponse.json({
      error: {
        message: '上传图片失败',
        code: 'PICTURE_UPLOAD_ERROR'
      }
    }, { status: 500 })
  }
}

// 获取所有图片
export async function GET() {
  try {
    const session = await getSessionUser()
    
    // TODO export prisma
    const pictures = await getAllPictures()
    const filteredPictures = pictures.filter(picture => {
      const isOwner = picture.owner.id === session.id
      if (isOwner) {
        return true
      }
      return !picture.isPrivate
    })
    return NextResponse.json(filteredPictures)
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({
        error: {
          message: '未登录',
          code: 'UNAUTHORIZED'
        }
      }, { status: 401 })
    }
    return NextResponse.json({
      error: {
        message: '获取图片列表失败',
        code: 'PICTURE_LIST_ERROR'
      }
    }, { status: 500 })
  }
}
