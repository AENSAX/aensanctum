import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// 获取用户列表
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isAdmin: true,
        isActive: true
      },
      orderBy: {
        id: 'asc'
      }
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({
      errors: [{
        field: 'user',
        message: '获取用户列表失败'
      }]
    }, { status: 500 })
  }
}

