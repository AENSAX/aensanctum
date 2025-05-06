import { NextResponse } from 'next/server'
import { getAllUsers, createUser } from '@/lib/user'
import { UserCreateSchema } from '@/lib/zod/schema'

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
  try {
    const body = await request.json()
    
    const result = UserCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({
        error: {
          message: result.error.errors[0].message,
          code: 'VALIDATION_ERROR',
          errors: result.error.errors
        }
      }, { status: 400 })
    }

    const { email, name, password } = result.data
    const user = await createUser(email, name, password)
    
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({
      error: {
        message: '创建用户失败',
        code: 'USER_CREATE_ERROR'
      }
    }, { status: 500 })
  }
} 