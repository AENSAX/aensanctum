import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/session/getSession'
import bcrypt from 'bcrypt'

// 重置密码
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({
      errors: [{
        field: 'unauthorized',
        message: '未授权'
      }]
    }, { status: 401 })
  }
  const admin = await prisma.user.findUnique({
    where: { id: session.id, isAdmin: true }
  })
  if (!admin) {
    return NextResponse.json({
      errors: [{
        field: 'unauthorized',
        message: '未授权'
      }]
    }, { status: 401 })
  }
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  })
  if (!user) {
    return NextResponse.json({
      errors: [{
        field: 'user',
        message: '用户不存在',
      }]
    }, { status: 404 })
  }
  const hashedPassword = await bcrypt.hash('mynewpassword123', 10)
  await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      password: hashedPassword
    }
  })
  return NextResponse.json({ status: 200 })
}

// 更新用户
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const schema = z.object({
    name: z.string().min(3, "用户名不能少于3个字符").max(20, "用户名不能超过20个字符"),
    isAdmin: z.boolean(),
    isActive: z.boolean()
  })
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({
      errors: [{
        field: 'unauthorized',
        message: '未授权'
      }]
    }, { status: 401 })
  }
  const admin = await prisma.user.findUnique({
    where: { id: session.id, isAdmin: true }
  })
  if (!admin) {
    return NextResponse.json({
      errors: [{
        field: 'unauthorized',
        message: '未授权'
      }]
    }, { status: 401 })
  }
  const result = schema.safeParse(await request.json())
  if (!result.success) {
    return NextResponse.json({
      errors: result.error.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message
      }))
    }, { status: 400 })
  }
  const { name, isAdmin, isActive } = result.data
  const { id } = await params
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { name, isAdmin, isActive }
  })
  return NextResponse.json(user)
}