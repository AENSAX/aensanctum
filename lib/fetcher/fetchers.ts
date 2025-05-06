import { User, Album, Picture } from "../interfaces/interfaces";
import useSWR from 'swr';
export const fetcher = async (url: string): Promise<any> => {
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return res.json()
}
export const useUser = () => {
    const { data: user, error, isLoading } = useSWR<User>('/api/auth/login', fetcher)
    return { user, error, isLoading }
}

export const useAlbums = () => {
    const { data: albums, error, isLoading } = useSWR<Album[]>('/api/albums', fetcher)
    return { albums, error, isLoading }
}

export const useMyAlbums = () => {
    const { data: albums, error, isLoading } = useSWR<Album[]>(`/api/my/albums`, fetcher)
    return { albums, error, isLoading }
}

export const useAlbum = (id: number) => {
    const { data: album, error, isLoading } = useSWR<Album>(`/api/albums/${id}`, fetcher)
    return { album, error, isLoading }
}

export const usePictures = () => {
    const { data: pictures, error, isLoading } = useSWR<Picture[]>('/api/pictures', fetcher)
    return { pictures, error, isLoading }
}

export const useMyPictures = () => {
    const { data: pictures, error, isLoading } = useSWR<Picture[]>(`/api/my/pictures`, fetcher)
    return { pictures, error, isLoading }
}

export const usePicture = (id: number) => {
    const { data: picture, error, isLoading } = useSWR<Picture>(`/api/pictures/${id}`, fetcher)
    return { picture, error, isLoading }
}

export const tagsFormater = (tags: string) => {
    return [...new Set(tags.split(' ').map((tag: string) => tag.trim()).filter(Boolean))]
}






