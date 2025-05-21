import prisma from '@/lib/db';
import { z } from 'zod';
import { checkAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

interface SearchResult {
    id: number;
    owner_id: number;
    is_private: boolean;
    name: string;
    search_text: string;
    pictures: {
        id: number;
        albumId: number;
        url: string;
        thumbnailUrl: string;
    }[];
    rank: number;
}

export async function GET(request: Request) {
    const authId = await checkAuth();
    if (authId === -1) {
        return NextResponse.json({ status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const keyword = searchParams.get('keyword')?.trim();
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const schema = z
        .string()
        .trim()
        .min(1, '至少输入1个字符')
        .max(100, '最多100个字符')
        .regex(
            /^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
            '关键字只能包含中英文、数字、空格和横杠',
        );
    const result = schema.safeParse(keyword);
    if (!result.success) {
        return NextResponse.json(
            {
                errors: result.error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            },
            { status: 400 },
        );
    }

    const searchResult = await prisma.$queryRawUnsafe<SearchResult[]>(
        `
        WITH first_pictures AS (
            SELECT DISTINCT ON ("albumId")
                id, url, "thumbnailUrl", "albumId"
            FROM "Picture"
            GROUP BY "albumId", "Picture".id
            ORDER BY "albumId", id
        )
        SELECT
            a.id,
            a."ownerId" as owner_id,
            a."isPrivate" as is_private,
            a.name,
            a."searchText" as search_text,
            COALESCE(
                json_agg(
                    CASE WHEN p.id IS NOT NULL THEN
                        json_build_object(
                            'id', p.id,
                            'albumId', a.id,
                            'url', p.url,
                            'thumbnailUrl', p."thumbnailUrl"
                        )
                    ELSE NULL
                    END
                ) FILTER (WHERE p.id IS NOT NULL),
                '[]'
            ) AS pictures,
            similarity(a."searchText", $1) AS rank
        FROM "Album" a 
        LEFT JOIN first_pictures p ON p."albumId" = a.id
        WHERE a."searchText" ILIKE '%' || $1 || '%'
        AND (
            (
                a."isPrivate" = false AND EXISTS (SELECT 1 FROM "Picture" WHERE "Picture"."albumId" = a.id)
            )
            OR a."ownerId" = $2
        )
        GROUP BY a.id, a."ownerId", a."isPrivate", a.name
        ORDER BY rank DESC
        LIMIT $3 OFFSET $4
    `,
        keyword,
        authId,
        pageSize,
        offset,
    );

    const countResult = await prisma.$queryRawUnsafe(
        `
        SELECT COUNT(*) as total
        FROM "Album" a 
        WHERE a."searchText" ILIKE '%' || $1 || '%'
        AND (
            (
                a."isPrivate" = false AND EXISTS (SELECT 1 FROM "Picture" WHERE "Picture"."albumId" = a.id)
            )
            OR a."ownerId" = $2
        )
        GROUP BY a.id, a."ownerId", a."isPrivate", a.name
    `,
        keyword,
        authId,
    );
    const albumsResponse = {
        albums: searchResult.map((album) => {
            return {
                id: album.id,
                ownerId: album.owner_id,
                isPrivate: album.is_private,
                pictures: album.pictures.map((picture) => {
                    return {
                        id: picture.id,
                        albumId: picture.albumId,
                        url: picture.url,
                        thumbnailUrl: picture.thumbnailUrl,
                    };
                }),
            };
        }),
        count: Array.isArray(countResult) ? countResult.length : 0,
    };
    return NextResponse.json(albumsResponse, { status: 200 });
}
