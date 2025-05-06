import prisma from './db';

// 创建用户
export async function createUser(email: string, name: string, password: string) {
  return prisma.user
  .create({
    data: {
      email,
      name,
      password
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  })
}

// 获取所有用户
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  })
}

// 根据ID获取用户
export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id }
  })
}

// 更新用户
export async function updateUser(id: number, data: { name?: string; email?: string; password?: string }) {
  return prisma.user.update({
    where: { id },
    data
  })
}

// 删除用户
export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: { id }
  })
}

// 根据邮箱查找用户
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
} 