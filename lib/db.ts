import { PrismaClient } from '@prisma/client';

// 创建一个新的 PrismaClient 实例的函数
const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    // 扩展 globalThis 类型以包含 'prisma' 属性
    // eslint-disable-next-line no-var
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 如果全局 'prisma' 实例可用则使用它，否则创建一个新的实例
const prisma = globalThis.prisma ?? prismaClientSingleton();

// 在非生产环境中，将 PrismaClient 实例存储为全局变量
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// 导出 PrismaClient 实例以供应用程序的其他部分使用
export default prisma;
