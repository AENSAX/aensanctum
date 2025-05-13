import { NextResponse } from 'next/server'
import { getAllUsers, createUser } from '@/lib/user'
import { z } from 'zod'
import prisma from '@/lib/db'
import bcrypt from 'bcrypt'

export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({
      error: {
        message: '获取用户列表失败',
        code: 'USER_LIST_ERROR'
      }
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const schema = z.object({
    email: z.string().email("邮箱格式不正确"),
    name: z.string().min(3, "用户名不能少于3个字符").max(20, "用户名不能超过20个字符"),
    password: z.string().min(8, "密码不能少于8个字符").max(20, "密码不能超过20个字符"),
  })
  const result = schema.safeParse(await request.json())
  if (!result.success) {
    return NextResponse.json({
      status: 400,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }, { status: 400 })
  }
  const userExist = await prisma.user.findUnique({
    where: { email: result.data.email }
  })
  if (userExist) {
    return NextResponse.json({
      status: 400,
      errors: [{
        field: 'email',
        message: '邮箱已存在'
      }]
    }, { status: 400 })
  }
  const { email, name, password } = result.data
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    }
  })
  return NextResponse.json({ status: 200 })
} 