import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAlbumById, updateAlbum, deleteAlbum, updateAlbumPictures } from '@/lib/album';
import prisma from '@/lib/db';

//删除我的图集
export async function DELETE(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const params = await context.params;
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('auth');

        if (!authCookie || authCookie.value !== 'true') {
            return NextResponse.json({
              error: {
                message: '未登录',
                code: 'UNAUTHORIZED'
              }
            }, { status: 401 });
        }

        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json({
              error: {
                message: '用户ID未找到',
                code: 'USER_NOT_FOUND'
              }
            }, { status: 401 });
        }

        const albumId = parseInt(params.id);

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
        if (album.owner.id !== parseInt(userId)) {
            return NextResponse.json({
              error: {
                message: '非法请求',
                code: 'INVALID_REQUEST'
              }
            }, { status: 403 });
        }
        await deleteAlbum(albumId);

        return NextResponse.json({ success: true, message: '图集删除成功' }, { status: 200 });
    } catch (error) {
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
    context: { params: { id: string } }
) {
    try {
        const params = await context.params;
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('auth');

        if (!authCookie || authCookie.value !== 'true') {
            return NextResponse.json({
              error: {
                message: '未登录',
                code: 'UNAUTHORIZED'
              }
            }, { status: 401 });
        }

        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json({
              error: {
                message: '用户ID未找到',
                code: 'USER_NOT_FOUND'
              }
            }, { status: 401 });
        }

        const { name, tags, addPictures, removePictures, isPrivate } = await request.json();
        const albumId = parseInt(params.id);

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
        if (currentAlbum.owner.id !== parseInt(userId)) {
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
    } catch (error) {
        return NextResponse.json({
            error: {
                message: '更新图集失败',
                code: 'ALBUM_UPDATE_ERROR'
            }
        }, { status: 500 });
    }
}
