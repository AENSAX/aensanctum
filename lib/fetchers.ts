import { User, Album, AlbumDetail, Picture, Tag, ErrorResponse } from './types';
import useSWR from 'swr';

export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const result = await res.json();
        throw new ErrorResponse(result.errors);
    }
    return res.json();
};
export const useUser = () => {
    const {
        data: user,
        error: userErrors,
        isLoading: userLoading,
    } = useSWR<User>('/api/auth/login', fetcher);
    return { user, userErrors, userLoading };
};

export const useUsers = (page: number) => {
    const {
        data: paginatedUsers,
        error: usersErrors,
        isLoading: usersLoading,
    } = useSWR<{ users: User[]; count: number }>(
        `/api/admin/users?page=${page}`,
        fetcher,
    );
    return { paginatedUsers, usersErrors, usersLoading };
};

export const useAlbums = (page: number) => {
    const {
        data: paginatedAlbums,
        error: albumsErrors,
        isLoading: albumsLoading,
    } = useSWR<{ albums: Album[]; count: number }>(
        `/api/albums?page=${page}`,
        fetcher,
    );
    return { paginatedAlbums, albumsErrors, albumsLoading };
};

export const useMyAlbums = (page: number) => {
    const {
        data: paginatedAlbums,
        error: albumsErrors,
        isLoading: albumsLoading,
    } = useSWR<{ albums: Album[]; count: number }>(
        `/api/my/albums?page=${page}`,
        fetcher,
    );
    return { paginatedAlbums, albumsErrors, albumsLoading };
};

export const useAlbum = (id: string) => {
    const {
        data: album,
        error: albumErrors,
        isLoading: albumLoading,
    } = useSWR<AlbumDetail>(`/api/albums/${id}`, fetcher);
    return { album, albumErrors, albumLoading };
};

export const useTagAlbums = (id: string, page: number) => {
    const {
        data: paginatedAlbums,
        error: albumsErrors,
        isLoading: albumsLoading,
    } = useSWR<{ albums: Album[]; count: number }>(
        `/api/tags/${id}/albums?page=${page}`,
        fetcher,
    );
    return { paginatedAlbums, albumsErrors, albumsLoading };
};

export const useAlbumPictures = (page: number, id: string) => {
    const {
        data: paginatedPictures,
        error: picturesErrors,
        isLoading: picturesLoading,
    } = useSWR<Picture[]>(`/api/albums/${id}/pictures?page=${page}`, fetcher);
    return {
        paginatedPictures,
        picturesErrors,
        picturesLoading,
    };
};

export const useTag = (id: string) => {
    const {
        data: tag,
        error: tagErrors,
        isLoading: tagLoading,
    } = useSWR<Tag>(`/api/tags/${id}`, fetcher);
    return { tag, tagErrors, tagLoading };
};

export const useTags = (page: number) => {
    const {
        data: paginatedTags,
        error: tagsErrors,
        isLoading: tagsLoading,
    } = useSWR<{ tags: Tag[]; count: number }>(
        `/api/tags?page=${page}`,
        fetcher,
    );
    return { paginatedTags, tagsErrors, tagsLoading };
};

export const useSearch = (page: number, keyword: string) => {
    const {
        data: paginatedAlbums,
        error: albumsErrors,
        isLoading: albumsLoading,
    } = useSWR<{ albums: Album[]; count: number }>(
        `/api/search?page=${page}&keyword=${keyword}`,
        fetcher,
    );
    return { paginatedAlbums, albumsErrors, albumsLoading };
};

export const tagsFormater = (tags: string) => {
    return [
        ...new Set(
            tags
                .split(' ')
                .map((tag: string) => tag.trim())
                .filter(Boolean),
        ),
    ];
};
