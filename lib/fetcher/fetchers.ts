import { User, Album, AlbumDetail, Picture } from '../interfaces/interfaces';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const result = await res.json();
        throw new Error(result.errors);
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

export const useUsers = () => {
    const getIndex = (index: number, previousPageData: User[]) => {
        if (previousPageData && previousPageData.length === 0) {
            return null;
        }
        return `/api/admin/users?page=${index + 1}`;
    };
    const {
        data: paginatedUsers,
        error: usersErrors,
        isLoading: usersLoading,
        size,
        setSize,
    } = useSWRInfinite<User[]>(getIndex, fetcher);
    return { paginatedUsers, usersErrors, usersLoading, size, setSize };
};

export const useAlbums = (
    getIndex: (index: number, previousPageData: Album[]) => string | null,
) => {
    const {
        data: paginatedAlbums,
        error: albumsErrors,
        isLoading: albumsLoading,
        size,
        setSize,
    } = useSWRInfinite<Album[]>(getIndex, fetcher);

    return { paginatedAlbums, albumsErrors, albumsLoading, size, setSize };
};

export const useMyAlbums = (
    getIndex: (index: number, previousPageData: Album[]) => string | null,
) => {
    const {
        data: paginatedAlbums,
        error: albumsErrors,
        isLoading: albumsLoading,
        size,
        setSize,
    } = useSWRInfinite<Album[]>(getIndex, fetcher);
    return { paginatedAlbums, albumsErrors, albumsLoading, size, setSize };
};

export const useAlbum = (id: string) => {
    const {
        data: album,
        error: albumErrors,
        isLoading: albumLoading,
    } = useSWR<AlbumDetail>(`/api/albums/${id}`, fetcher);
    return { album, albumErrors, albumLoading };
};

export const useAlbumPictures = (
    getIndex: (index: number, previousPageData: Picture[]) => string | null,
) => {
    const {
        data: paginatedPictures,
        error: picturesErrors,
        isLoading: picturesLoading,
        size,
        setSize,
    } = useSWRInfinite<Picture[]>(getIndex, fetcher);
    return {
        paginatedPictures,
        picturesErrors,
        picturesLoading,
        size,
        setSize,
    };
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
