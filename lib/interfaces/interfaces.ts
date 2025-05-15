export interface Album {
    id: number;
    ownerId: number;
    isPrivate: boolean;
    pictures: Picture[];
}
export interface AlbumDetail {
    createdAt: string;
    owner: {
        name: string;
        id: number;
    };
    pictures: Picture[];
    name: string;
    id: number;
    description: string;
    tags: string[];
    ownerId: number;
    isPrivate: boolean;
}

export interface Picture {
    albumId: number
    id: number
    url: string
    thumbnailUrl: string
}

export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    isAdmin: boolean;
    isActive: boolean;
}


