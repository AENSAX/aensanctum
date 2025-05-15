import { User, Album, AlbumDetail } from '../interfaces/interfaces';
import useSWR from 'swr';
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

export const useAlbums = () => {
    const {
        data: albums,
        error: albumsErrors,
        isLoading: albumsLoading,
    } = useSWR<Album[]>('/api/albums', fetcher);
    return { albums, albumsErrors, albumsLoading };
};

export const useMyAlbums = () => {
    const {
        data: albums,
        error: albumsErrors,
        isLoading: albumsLoading,
    } = useSWR<Album[]>(`/api/my/albums`, fetcher);
    return { albums, albumsErrors, albumsLoading };
};

export const useAlbum = (id: string) => {
    const {
        data: album,
        error: albumErrors,
        isLoading: albumLoading,
    } = useSWR<AlbumDetail>(`/api/albums/${id}`, fetcher);
    return { album, albumErrors, albumLoading };
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
