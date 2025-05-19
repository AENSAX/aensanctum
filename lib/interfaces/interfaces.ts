export interface Album {
    id: number;
    ownerId: number;
    isPrivate: boolean;
    pictures: Picture[]; //只查询第一张作为封面图
}

export interface AlbumDetail {
    createdAt: string;
    owner: {
        name: string;
        id: number;
    };
    pictures: Picture[]; //只查询第一张作为封面图
    _count: {
        pictures: number;
    };
    name: string;
    id: number;
    description: string;
    tags: string[];
    ownerId: number;
    isPrivate: boolean;
}

export interface Picture {
    albumId: number;
    id: number;
    url: string;
    thumbnailUrl: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    isAdmin: boolean;
    isActive: boolean;
}

export class ErrorResponse extends Error {
    errors: { field: string; message: string }[];

    constructor(errors: { field: string; message: string }[]) {
        super('Validation failed');
        this.errors = errors;
        this.name = 'ErrorResponse';
    }
}
