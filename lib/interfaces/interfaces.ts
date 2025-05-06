export interface Album {
    id: number;
    name: string;
    isPrivate: boolean;
    createdAt: Date;
    tags: string[];
    albumPictures: AlbumPicture[];
    owner: {
        id: number;
        name: string;
        email: string;
    };
}

export interface Picture {
    id: number
    title: string
    url: string
    tags: string[]
    isPrivate: boolean
    createdAt: Date
    owner: {
        id: number
        name: string
        email: string
    }
}

export interface AlbumPicture extends Picture {
    order: number
}

export interface User {
    id: number;
    name: string;
    email: string;
}


