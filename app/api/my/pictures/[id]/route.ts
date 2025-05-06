import { NextResponse } from 'next/server'
import { getPictureById, updatePicture, deletePicture } from '@/lib/picture'
import { cookies } from 'next/headers'

// 更新我的图片
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies();
        const auth = cookieStore.get('auth')?.value;
        if (!auth) {
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

        const pictureId = parseInt(id);
        const body = await request.json();
        const { title, tags, isPrivate } = body;

        if (!pictureId) {
            return NextResponse.json({
              error: {
                message: '图片ID未找到',
                code: 'PICTURE_ID_NOT_FOUND'
              }
            }, { status: 400 });
        }

        const picture = await getPictureById(pictureId);
        if (!picture) {
            return NextResponse.json({
              error: {
                message: '图片不存在',
                code: 'PICTURE_NOT_FOUND'
              }
            }, { status: 404 });
        }
        if (picture.owner.id !== parseInt(userId)) {
            return NextResponse.json({
              error: {
                message: '非法请求',
                code: 'INVALID_REQUEST'
              }
            }, { status: 403 });
        }

        const updatedTitle = title || picture.title;
        const updatedTags = tags || picture.tags;
        const updatedIsPrivate = isPrivate;
        const updatedPicture = await updatePicture(pictureId, {
            title: updatedTitle,
            tags: updatedTags,
            isPrivate: updatedIsPrivate
        });

        return NextResponse.json(updatedPicture, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: {
                message: '更新图片失败',
                code: 'PICTURE_UPDATE_ERROR'
            }
        }, { status: 500 });
    }
}

// 删除我的图片
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies();
        const auth = cookieStore.get('auth')?.value;
        if (!auth) {
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

        const pictureId = parseInt(id);

        if (!pictureId) {
            return NextResponse.json({
              error: {
                message: '图片ID未找到',
                code: 'PICTURE_ID_NOT_FOUND'
              }
            }, { status: 400 });
        }
        const picture = await getPictureById(pictureId);
        if (!picture) {
            return NextResponse.json({
              error: {
                message: '图片不存在',
                code: 'PICTURE_NOT_FOUND'
              }
            }, { status: 404 });
        }
        if (picture.owner.id !== parseInt(userId)) {
            return NextResponse.json({
              error: {
                message: '非法请求',
                code: 'INVALID_REQUEST'
              }
            }, { status: 403 });
      }
        const response = await deletePicture(pictureId);
        if (!response) {
            return NextResponse.json({
              error: {
                message: '图片不存在',
                code: 'PICTURE_NOT_FOUND'
              }
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: '图片删除成功' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: {
                message: '删除图片失败',
                code: 'PICTURE_DELETE_ERROR'
            }
        }, { status: 500 });
    }
}
