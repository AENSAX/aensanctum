import prisma from './db'
import { formatPictureResponse } from './zod/format'
import { PictureResponseSchema } from './zod/schema'


//创建图片
export async function createPicture(title: string, tags: string[], ownerId: number, url: string) {
  try {
    await prisma.picture.create({
      data: { title, tags, ownerId, url }
    });
    return { success: true, message: '图片创建成功' };
  } catch (error) {
    throw new Error('创建图片失败');
  }
}
// 获取所有图片
export async function getAllPictures() {
  try {
    const pictures = await prisma.picture.findMany({
      select: {
        id: true,
        title: true,
        url: true,
        tags: true,
        isPrivate: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    const responsePictures = pictures.map(p => PictureResponseSchema.parse(formatPictureResponse(p)))
    return responsePictures;
  } catch (error) {
    throw new Error('获取图片列表失败');
  }
}

// 根据ownerId获取图片列表
export async function getPictureListByOwnerId(ownerId: number) {
  try {
    const pictures = await prisma.picture.findMany({
      where: { ownerId },
      select: {
        id: true,
        title: true,
        url: true,
        tags: true,
        isPrivate: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    const responsePictures = pictures.map(p => PictureResponseSchema.parse(formatPictureResponse(p)))
    return responsePictures;
  } catch (error) {
    throw new Error('获取图片列表失败');
  }
}

// 根据id获取图片
export async function getPictureById(id: number) {
  try {
    const picture = await prisma.picture.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        url: true,
        tags: true,
        isPrivate: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    if (!picture) return null
    return PictureResponseSchema.parse(formatPictureResponse(picture))
  } catch (error) {
    throw new Error('获取图片失败');
  }
}

// 删除图片
export async function deletePicture(id: number) {
  try {
    await prisma.picture.delete({
      where: { id },
    });
    return { success: true, message: '图片删除成功' };
  } catch (error) {
    throw new Error('删除图片失败');
  }
}

// 更新图片
export async function updatePicture(id: number, data: { title: string, tags: string[], isPrivate: boolean }) {
  try {
    await prisma.picture.update({
      where: { id },
      data
    });
    return { success: true, message: '图片更新成功' };
  } catch (error) {
    throw new Error('更新图片失败');
  }
}