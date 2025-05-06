export const formatAlbumResponse = (album: any) => {
    return {
        id: album.id,
        name: album.name,
        tags: album.tags,
        isPrivate: album.isPrivate,
        owner: {
            id: album.owner.id,
            name: album.owner.name,
            email: album.owner.email
        },
        createdAt: album.createdAt instanceof Date ? album.createdAt.toISOString() : album.createdAt,
        albumPictures: album.albumPictures.map((albumPicture: any) => {
            return {
                id: albumPicture.picture.id,
                title: albumPicture.picture.title,
                url: albumPicture.picture.url,
                isPrivate: albumPicture.picture.isPrivate,
                tags: albumPicture.picture.tags,
                owner: {
                    id: albumPicture.picture.owner.id,
                    name: albumPicture.picture.owner.name,
                    email: albumPicture.picture.owner.email
                },
                createdAt: albumPicture.picture.createdAt instanceof Date 
                    ? albumPicture.picture.createdAt.toISOString() 
                    : albumPicture.picture.createdAt,
                order: albumPicture.order
            }
        })
    }
}

export const formatPictureResponse = (picture: any) => {
    return {
        id: picture.id,
        title: picture.title,
        url: picture.url,
        isPrivate: picture.isPrivate,
        tags: picture.tags,
        owner: {
            id: picture.owner.id,
            name: picture.owner.name,
            email: picture.owner.email
        },
        createdAt: picture.createdAt instanceof Date ? picture.createdAt.toISOString() : picture.createdAt
    }
}

export const formatAlbumCreate = (data: any) => {
    return {
        name: data.name,
        tags: data.tags,
    }
}

export const formatAlbumUpdate = (data: any) => {
    return {
        name: data.name,
        tags: data.tags,
        isPrivate: data.isPrivate,
        addAlbumPictures: data.addAlbumPictures,
        deleteAlbumPictureIds: data.deleteAlbumPictureIds,
    }
}

export const formatPictureCreate = (data: FormData) => {
    return {
        title: data.get('title'),
        tags: data.get('tags'),
        image: data.get('image'),
    }
}

export const formatPictureUpdate = (data: any) => {
    return {
        title: data.title,
        tags: data.tags,
    }
}