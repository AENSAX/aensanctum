import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session/getSession';
import prisma from '@/lib/db';
import { z } from 'zod';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Readable } from 'stream';
import { checkAuth } from '@/lib/auth';

//删除我的图集
export async function DELETE(request: Request, { params }: { params: Promise<{ albumId: string }> }) {

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ status: 401 });
  }
  const { albumId } = await params;
  await prisma.album.delete({
    where: {
      id: parseInt(albumId),
      ownerId: session.id
    }
  })
  return NextResponse.json({ message: '图集删除成功' }, { status: 200 });
}

// 更新我的图集
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const schema = z.object({
    name: z.string()
      .min(1, "图集名称不能为空")
      .max(100, "图集名称不能超过100个字符")
      .regex(/^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/, "图集名称只能包含中英文、数字、空格和横杠"),
    tags: z.array(z.string()
      .min(1, "标签不能为空")
      .max(20, "标签不能超过20个字符")
      .regex(/^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/, "标签只能包含中英文、数字、空格和横杠")
    )
      .min(1, "至少需要一个标签")
      .max(10, "最多只能添加10个标签"),
    isPrivate: z.boolean({
      required_error: "缺少可见性信息"
    })
  })
  const authId = await checkAuth();
  if (authId === -1) {
    return NextResponse.json(
      {
        errors: [{
          field: 'unauthorized',
          message: '未授权'
        }]
      }, { status: 401 });
  }
  const { albumId } = await params
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json({
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }, { status: 400 });
  }
  const { name, tags, isPrivate } = result.data;

  const currentAlbum = await prisma.album.findUnique({
    where: {
      id: parseInt(albumId),
      ownerId: authId
    }
  });
  if (!currentAlbum) {
    return NextResponse.json({ status: 404 });
  }
  const updatedData = {
    name: name || currentAlbum.name,
    tags: tags || currentAlbum.tags,
    isPrivate: isPrivate ?? currentAlbum.isPrivate,
  };
  await prisma.album.update({
    where: {
      id: parseInt(albumId),
      ownerId: authId
    },
    data: updatedData
  });
  return NextResponse.json({ status: 200 });
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

function getFileNameFromUrl(url: string): string {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1];
}

async function processImage(url: string): Promise<string> {
  const fileName = getFileNameFromUrl(url);
  const key = `images/${fileName}`;
  
  const getCommand = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
  });
  
  const response = await s3.send(getCommand);
  if (!response.Body) {
    throw new Error('Failed to get image from R2');
  }

  const chunks = [];
  for await (const chunk of response.Body as Readable) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const thumbnailBuffer = await sharp(buffer)
    .resize(300, 300, {
      fit: 'inside',
      withoutEnlargement: true,
      position: 'centre'
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  const thumbnailFileName = `thumb_${fileName}`;
  const thumbnailKey = `thumbnails/${thumbnailFileName}`;

  const putCommand = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: 'image/jpeg',
  });

  await s3.send(putCommand);

  return `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${thumbnailKey}`;
}

const schema = z.object({
  urls: z.array(z.string().url()).min(1).max(10)
});

//上传图片
export async function POST(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const authId = await checkAuth();
  if (authId === -1) {
    return NextResponse.json({
      errors: [{
        field: 'unauthorized',
        message: '未授权'
      }]
    }, { status: 401 });
  }

  const album = await prisma.album.findFirst({
    where: {
      id: parseInt(albumId),
      ownerId: authId
    }
  });

  if (!album) {
    return NextResponse.json({
      errors: [{
        field: 'not_found',
        message: '图集不存在'
      }]
    }, { status: 404 });
  }

  const result = schema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json({
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }, { status: 400 });
  }

  const { urls } = result.data;

  try {
    const processedImages = await Promise.all(
      urls.map(async (url) => {
        const thumbnailUrl = await processImage(url);
        return {
          url,
          thumbnailUrl,
          albumId: parseInt(albumId)
        };
      })
    );

    await prisma.picture.createMany({
      data: processedImages
    });
  } catch (error) {
    return NextResponse.json({
      errors: [{
        field: 'internal_server_error',
        message: '处理图片失败'
      }]
    }, { status: 500 });
  }

  return NextResponse.json({ status: 200 });
}
