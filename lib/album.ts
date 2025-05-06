import prisma from './db'
import { formatAlbumResponse } from './zod/format'
import { AlbumResponseSchema } from './zod/schema'

// 获取所有的图集
export async function getAllAlbums() {
    try {
        const albums = await prisma.album.findMany({
            include: {
                albumPictures: {
                    include: {
                        picture: {
                            select: {
                                id: true,
                                title: true,
                                url: true,
                                isPrivate: true,
                                tags: true,
                                createdAt: true,
                                owner: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        const responseAlbums = albums.map(album => {
            const formattedAlbum = formatAlbumResponse(album)
            const responseAlbum = AlbumResponseSchema.parse(formattedAlbum)
            return responseAlbum
        })
        return responseAlbums
    } catch (error) {
        throw new Error('获取图集失败')
    }
}

// 根据用户ID获取图集
export async function getAlbumsByOwnerId(ownerId: number) {
    try {
        const albums = await prisma.album.findMany({
            where: {
                ownerId: ownerId
            },
            include: {
                albumPictures: {
                    include: {
                        picture: {
                            select: {
                                id: true,
                                title: true,
                                url: true,
                                isPrivate: true,
                                tags: true,
                                createdAt: true,
                                owner: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        const responseAlbums = albums.map(album => {
            return AlbumResponseSchema.parse(formatAlbumResponse(album))
        })
        return responseAlbums
    } catch (error) {
        throw new Error('获取图集失败')
    }
}

// 创建图集
export async function createAlbum(name: string, tags: string[], ownerId: number) {
    try {
        await prisma.album.create({
            data: {
                name,
                tags,
                ownerId,
            }
        })
        return {
            success: true,
            message: '图集创建成功'
        }
    } catch (error) {
        throw new Error('创建图集失败')
    }
}

// 批量更新图集中的图片
export async function updateAlbumPictures(albumId: number, picturesToAdd: { pictureId: number, order: number }[], picturesToRemove: { pictureId: number }[]) {
    try {
        await prisma.$transaction(async (tx) => {
            if (picturesToRemove.length > 0) {
                await tx.albumPicture.deleteMany({
                    where: {
                        albumId: albumId,
                        pictureId: {
                            in: picturesToRemove.map(p => p.pictureId)
                        }
                    }
                })
            }

            if (picturesToAdd.length > 0) {
                await tx.albumPicture.createMany({
                    data: picturesToAdd.map(p => ({
                        albumId: albumId,
                        pictureId: p.pictureId,
                        order: p.order
                    }))
                })
            }
        })

        return {
            success: true,
            message: '图集更新成功'
        }
    } catch (error) {
        console.error('更新图集失败:', error)
        throw new Error('更新图集失败')
    }
}

//根据id获取图集
export async function getAlbumById(id: number) {
    try {
        const album = await prisma.album.findUnique({
            where: {
                id: id
            },
            include: {
                albumPictures: {
                    include: {
                        picture: {
                            select: {
                                id: true,
                                title: true,
                                url: true,
                                isPrivate: true,
                                tags: true,
                                createdAt: true,
                                owner: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })
        if (!album) return null
        const responseAlbum = AlbumResponseSchema.parse(formatAlbumResponse(album))
        return responseAlbum
    } catch (error) {
        throw new Error('获取图集失败')
    }
}

//更新图集信息
export async function updateAlbum(id: number, data: { 
    name: string, 
    tags: string[], 
    isPrivate: boolean,
}) {
    try {
        await prisma.album.update({
            where: { id },
            data: {
                name: data.name,
                tags: data.tags,
                isPrivate: data.isPrivate
            }
        })
        return {
            success: true,
            message: '图集更新成功'
        }
    } catch (error) {
        throw new Error('更新图集失败')
    }
}

//删除图集
export async function deleteAlbum(id: number) {
    try {
        console.log('👏delete',id)
        await prisma.album.delete({
            where: { id }
        })
        console.log('👏delete success',id)
        return {
            success: true,
            message: '图集删除成功'
        }
    } catch (error) {
        console.log('👏delete error',error)
        throw new Error('删除图集失败')
    }
}