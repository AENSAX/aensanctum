import { z } from 'zod'

const OwnerSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string()
})

export const PictureResponseSchema = z.object({
    id: z.number(),
    title: z.string(),
    tags: z.array(z.string()),
    url: z.string(),
    isPrivate: z.boolean(),
    owner: OwnerSchema,
    createdAt: z.string(),
})

const AlbumPictureResponseSchema = z.object({
    ...PictureResponseSchema.shape,
    order: z.number()
})

export const AlbumResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    tags: z.array(z.string()),
    albumPictures: z.array(AlbumPictureResponseSchema),
    isPrivate: z.boolean(),
    owner: OwnerSchema,
    createdAt: z.string(),
})

export const PictureCreateSchema = z.object({
    formData: z.object({
        title: z.string(),
        tags: z.string().transform(str => str.split(',')).pipe(z.array(z.string())),
        image: z.instanceof(File).refine(
            file => ['image/*'].includes(file.type)
        )
    })
})

export const PictureUpdateSchema = z.object({
    title: z.string().optional(),
    tags: z.string().transform(str => str.split(',')).pipe(z.array(z.string())).optional(),
    isPrivate: z.boolean().optional(),
})

export const AlbumCreateSchema = z.object({
    name: z.string(),
    tags: z.array(z.string()),
})

export const AlbumUpdateSchema = z.object({
    name: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPrivate: z.boolean().optional(),
    addAlbumPictures: z.array(AlbumPictureResponseSchema).optional(),
    deleteAlbumPictureIds: z.array(z.number()).optional(),
})

export const UserCreateSchema = z.object({
    email: z.string()
        .email('邮箱格式不正确')
        .min(5, '邮箱长度至少5个字符')
        .max(50, '邮箱长度不能超过50个字符'),
    name: z.string()
        .min(2, '用户名至少2个字符')
        .max(20, '用户名不能超过20个字符'),
    password: z.string()
        .min(8, '密码至少8个字符')
        .max(50, '密码不能超过50个字符')
})

export type UserCreate = z.infer<typeof UserCreateSchema>

