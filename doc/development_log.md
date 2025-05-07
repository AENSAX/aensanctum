## 数据库配置信息
sudo -u postgres psql -c "CREATE USER aensanctum WITH PASSWORD 'aensanctum';" && sudo -u postgres psql -c "CREATE DATABASE aensanctum OWNER aensanctum;"
### PostgreSQL 配置
- 数据库名称：aensanctum
- 数据库用户：aensanctum
- 数据库密码：[1937782304wqj]
- 数据库主机：localhost
- 数据库端口：5432

### 创建表命令
```
npx prisma migrate dev --name [opt name]

npx prisma generate
```

## API 文档

### User 相关

#### 获取所有用户
- **请求**: `GET /api/users`
- **响应**:
```json
{
  "users": [
    {
      "id": "number",
      "email": "string",
      "name": "string",
      "createdAt": "Date"
    }
  ]
}
```

#### 创建新用户
- **请求**: `POST /api/users`
- **请求体**:
```json
{
  "email": "string",
  "name": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "createdAt": "Date"
  }
}
```

### Auth 相关

#### 登录
- **请求**: `POST /api/auth/login`
- **请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "success": true,
  "user": {
    "id": "number",
    "email": "string",
    "name": "string"
  }
}
```

#### 登出
- **请求**: `POST /api/auth/logout`
- **响应**:
```json
{
  "success": true,
  "message": "登出成功"
}
```

#### 获取当前登录用户
- **请求**: `GET /api/auth/login`
- **响应**:
```json
{
  "userWithoutPassword": {
    "id": "number",
    "email": "string",
    "name": "string",
    "createdAt": "Date"
  }
}
```

### Pictures 相关

#### 获取所有图片
- **请求**: `GET /api/pictures`
- **响应**:
```json
{
  "pictures": [
    {
      "id": "number",
      "title": "string",
      "url": "string",
      "tags": "string[]",
      "ownerId": "number",
      "isPrivate": "boolean",
      "createdAt": "Date"
    }
  ]
}
```
#### 获取我的图片
- **请求**: `GET /api/my/pictures`
- **响应**:
```json
{
  "pictures": [
    {
      "id": "number",
      "title": "string",
      "url": "string",
      "tags": "string[]",
      "ownerId": "number",
      "isPrivate": "boolean",
      "createdAt": "Date",
    }
  ]
}
```

#### 获取单张图片
- **请求**: `GET /api/pictures/[id]`
- **响应**:
```json
{
  "picture": {
    "owner": {
      "name": "string",
      "id": "number",
      "email": "string"
    },
    "tags": "string[]",
    "id": "number",
    "title": "string",
    "url": "string",
    "ownerId": "number",
    "isPrivate": "boolean",
    "createdAt": "Date"
  }
}
```

#### 上传图片
- **请求**: `POST /api/pictures`
- **请求体**: 

`multipart/form-data`
```json
{
  "title": "string",
  "tags": "string[]",
  "isPrivate": "boolean",
  "image": "File"
}
```
- **响应**:
```json
{
  "picture": {
    "tags": "string[]",
    "id": "number",
    "title": "string",
    "url": "string",
    "ownerId": "number",
    "isPrivate": "boolean",
    "createdAt": "Date"
  }
}
```

#### 删除图片
- **请求**: `DELETE /api/my/pictures/[id]`
- **响应**:
```json
{
  "success": "boolean",
  "message": "string"
}
```

#### 更新图片
- **请求**: `PUT /api/my/pictures/[id]`
- **请求体**:
```json
{
  "title": "string",
  "tags": "string[]",
  "isPrivate": "boolean"
}
```
- **响应**:
```json
{
  "updatedPicture": {
    "id": "number",
    "title": "string",
    "tags": "string[]",
    "url": "string",
    "ownerId": "number",
    "isPrivate": "boolean",
    "createdAt": "Date"
  }
}
```

### Albums 相关

#### 获取所有图集
- **请求**: `GET /api/albums`
- **响应**:
```json
{
  "albums": [
    {
      "id": "number",
      "name": "string",
      "tags": "string[]",
      "ownerId": "number",
      "createdAt": "Date",
      "isPrivate": "Boolean",
      "pictures": [
        {
          "id": "number",
          "title": "string",
          "url": "string",
          "isPrivate": "boolean",
          "order": "number"
        }
      ]
    }
  ]
}
```

#### 获取我的图集
- **请求**: `GET /api/my/albums`
- **响应**:
```json
{
  "albums": [
    {
      "id": "number",
      "name": "string",
      "tags": "string[]",
      "ownerId": "number",
      "createdAt": "Date",
      "isPrivate": "boolean",
      "pictures": [
        {
          "id": "number",
          "title": "string",
          "url": "string",
          "isPrivate": "boolean",
          "order": "number"
        }
      ]
    }
  ]
}
```
#### 获取某个图集
- **请求**: `GET /api/albums/[id]`
- **响应**:
```json
{
  "album": {
    "id": "number",
    "name": "string",
    "tags": "string[]",
    "ownerId": "number",
    "createdAt": "Date",
    "isPrivate": "boolean",
    "owner": {
      "name": "string",
      "id": "number",
      "email": "string"
    },
    "pictures": [
      {
        "id": "number",
        "title": "string",
        "url": "string",
        "isPrivate": "boolean",
        "order": "number"
      }
    ]
  }
}
```
#### 创建图集
- **请求**: `POST /api/albums`
- **请求体**:
```json
{
  "name": "string",
  "tags": "string[]",
  "isPrivate": "boolean"
}
```
- **响应**:
```json
{
  "album": {
    "id": "number",
    "name": "string",
    "tags": "string[]",
    "ownerId": "number",
    "isPrivate": "boolean",
    "createdAt": "Date",
  }
}
```

#### 更新图集
- **请求**: `PUT /api/my/albums/[id]`
- **请求体**:
```json
{
  "name": "string",
  "tags": "string[]",
  "isPrivate": "boolean",
  "addPictureIds": "number[]",
  "removePictureIds": "number[]"
}
```
- **响应**:
```json
{
  "album": {
    "id": "number",
    "name": "string",
    "tags": "string[]",
    "ownerId": "number",
    "isPrivate": "boolean",
    "createdAt": "Date",
    "pictures": [
      {
        "id": "number",
        "title": "string",
        "url": "string"
      }
    ]
  }
}
```

#### 删除图集
- **请求**: `DELETE /api/my/albums/[id]`
- **响应**:
```json
{
  "success": "boolean",
  "message": "string"
}
```

### 错误响应
所有 API 在发生错误时都会返回以下格式：
```json
{
  "error": {
    "message": "string",
    "code": "string"
  }
}
```

### 错误码说明

- `UNAUTHORIZED`: 未登录或认证失败
- `LOGOUT_ERROR`: 登出失败
- `USER_NOT_FOUND`: 用户ID未找到
- `USER_INFO_NOT_FOUND`: 用户信息未找到
- `PASSWORD_ERROR`: 密码错误
- `PICTURE_NOT_FOUND`: 图片不存在
- `PICTURE_ID_NOT_FOUND`: 图片ID未找到
- `ALBUM_NOT_FOUND`: 图集不存在
- `ALBUM_PRIVATE`: 图集是私有的
- `PICTURE_PRIVATE`: 图片是私有的
- `EMPTY_ALBUM_NAME`: 图集名称不能为空
- `INVALID_REQUEST`: 非法请求
- `EMPTY_FILE`: 文件为空
- `UNSUPPORTED_FILE_TYPE`: 不支持的文件类型
- `PICTURE_UPLOAD_ERROR`: 上传图片失败
- `PICTURE_UPDATE_ERROR`: 更新图片失败
- `PICTURE_DELETE_ERROR`: 删除图片失败
- `PICTURE_LIST_ERROR`: 获取图片列表失败
- `PICTURE_GET_ERROR`: 获取图片失败
- `MY_PICTURE_LIST_ERROR`: 获取我的图片列表失败
- `ALBUM_CREATE_ERROR`: 创建图集失败
- `ALBUM_UPDATE_ERROR`: 更新图集失败
- `ALBUM_DELETE_ERROR`: 删除图集失败
- `ALBUM_LIST_ERROR`: 获取图集列表失败
- `USER_CREATE_ERROR`: 创建用户失败
- `USER_LIST_ERROR`: 获取用户列表失败
- `SERVER_ERROR`: 服务器错误