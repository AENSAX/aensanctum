import { NextResponse } from 'next/server';
import { getAlbumById, updateAlbum, deleteAlbum, updateAlbumPictures } from '@/lib/album';
import { getSessionUser } from '@/lib/session/getSession';
import prisma from '@/lib/db';

//删除我的图集
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSessionUser();

        const albumId = parseInt(id);

        if (!albumId) {
            return NextResponse.json({
              error: {
                message: '图集ID未找到',
                code: 'ALBUM_ID_NOT_FOUND'
              }
            }, { status: 400 });
        }

        const album = await getAlbumById(albumId);
        if (!album) {
            return NextResponse.json({
              error: {
                message: '图集不存在',
                code: 'ALBUM_NOT_FOUND'
              }
            }, { status: 404 });
        }
        if (album.owner.id !== session.id) {
            return NextResponse.json({
              error: {
                message: '非法请求',
                code: 'INVALID_REQUEST'
              }
            }, { status: 403 });
        }
        await deleteAlbum(albumId);

        return NextResponse.json({ success: true, message: '图集删除成功' });
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
                message: '删除图集失败',
                code: 'ALBUM_DELETE_ERROR'
            }
        }, { status: 500 });
    }
}

// 更新我的图集
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSessionUser();

        // TODO zod validation
        const { name, tags, addPictures, removePictures, isPrivate } = await request.json();
        const albumId = parseInt(id);

        if (!albumId) {
            return NextResponse.json({
              error: {
                message: '图集ID未找到',
                code: 'ALBUM_ID_NOT_FOUND'
              }
            }, { status: 400 });
        }

        const currentAlbum = await getAlbumById(albumId);
        if (!currentAlbum) {
            return NextResponse.json({
              error: {
                message: '图集不存在',
                code: 'ALBUM_NOT_FOUND'
              }
            }, { status: 404 });
        }
        if (currentAlbum.owner.id !== session.id) {
            return NextResponse.json({
              error: {
                message: '非法请求',
                code: 'INVALID_REQUEST'
              }
            }, { status: 403 });
        }

        const updatedData = {
            name: name || currentAlbum.name,
            tags: tags || currentAlbum.tags,
            isPrivate: isPrivate ?? currentAlbum.isPrivate,
        };
        await updateAlbum(albumId, updatedData);
        // 更新图集中的图片
        if (Array.isArray(addPictures) || Array.isArray(removePictures)) {
            const picturesToAdd = addPictures?.map((p: any) => ({
                pictureId: p.id,
                order: p.order
            })) || []
            
            const picturesToRemove = removePictures?.map((p: any) => ({
                pictureId: p.id
            })) || []

            await updateAlbumPictures(albumId, picturesToAdd, picturesToRemove)
        }

        return NextResponse.json({
            success: true,
            message: '图集更新成功'
        }, { status: 200 });
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
                message: '更新图集失败',
                code: 'ALBUM_UPDATE_ERROR'
            }
        }, { status: 500 });
    }
}
