'use client';

import { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Chip,
    CircularProgress,
    Pagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useUser } from '@/lib/fetcher/fetchers';
import { User } from '@/lib/interfaces/interfaces';
import { ConfirmDialog } from '@/app/_components/dialog';
import { EditUserDialog } from '@/app/_components/admin';
import { useUsers } from '@/lib/fetcher/fetchers';
import Link from 'next/link';

export default function AdminPage() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] =
        useState(false);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
        null,
    );
    const [currentPage, setCurrentPage] = useState(1);

    const { user: currentUser, userLoading, userErrors } = useUser();
    const { paginatedUsers, usersErrors, usersLoading } = useUsers(currentPage);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number,
    ) => {
        setCurrentPage(value);
    };

    if (userLoading || usersLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    if (userErrors && userErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {userErrors.map((error: { field: string; message: string }) => (
                    <Typography key={error.field} color="error">
                        {error.message}
                    </Typography>
                ))}
            </Box>
        );
    }
    if (!currentUser) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography align="center">请先登录</Typography>

                <Link href="/login">
                    <Typography
                        sx={{ mt: 2, color: 'primary.main' }}
                        variant="h6"
                    >
                        登录
                    </Typography>
                </Link>
            </Box>
        );
    }
    if (!currentUser.isAdmin) {
        return <Typography color="error">你不是管理员</Typography>;
    }
    if (usersErrors && usersErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {usersErrors.map(
                    (error: { field: string; message: string }) => (
                        <Typography key={error.field} color="error">
                            {error.message}
                        </Typography>
                    ),
                )}
            </Box>
        );
    }

    const currentUsers = paginatedUsers?.users || [];
    const totalPages = paginatedUsers?.count
        ? Math.ceil(paginatedUsers.count / 10)
        : 0;

    if (!currentUsers || currentUsers.length === 0) {
        return <Typography align="center">暂无用户</Typography>;
    }

    const handleEditUser = async (userData: Partial<User>) => {
        if (!selectedUser) return;
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const result = await response.json();
            throw result;
        }
        setEditDialogOpen(false);
        setSelectedUser(null);
    };

    const handleResetPassword = async (userId: number) => {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'POST',
        });

        if (!response.ok) {
            const result = await response.json();
            throw result;
        }
        alert('密码重置成功');
        setResetPasswordDialogOpen(false);
        setUserToResetPassword(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>邮箱</TableCell>
                            <TableCell>用户名</TableCell>
                            <TableCell>创建时间</TableCell>
                            <TableCell>状态</TableCell>
                            <TableCell>权限</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentUsers.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>
                                    {new Date(user.createdAt).toLocaleString(
                                        'zh-CN',
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.isActive ? '正常' : '封禁'}
                                        color={
                                            user.isActive ? 'success' : 'error'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={
                                            user.isAdmin ? '管理员' : '普通用户'
                                        }
                                        sx={{
                                            backgroundColor: user.isAdmin
                                                ? '#1976d2'
                                                : '#e0e0e0',
                                            color: user.isAdmin
                                                ? 'white'
                                                : 'black',
                                        }}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setEditDialogOpen(true);
                                        }}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setUserToResetPassword(user);
                                            setResetPasswordDialogOpen(true);
                                        }}
                                        size="small"
                                    >
                                        <LockResetIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}
            >
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                />
            </Box>

            <EditUserDialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onSave={handleEditUser}
            />

            <ConfirmDialog
                isOpen={resetPasswordDialogOpen}
                onClose={() => {
                    setResetPasswordDialogOpen(false);
                    setUserToResetPassword(null);
                }}
                title="重置密码"
                content="确定要重置该用户密码吗？"
                primaryButton={{
                    text: '确定',
                    onClick: () =>
                        userToResetPassword &&
                        handleResetPassword(userToResetPassword.id),
                }}
                secondaryButton={{
                    text: '取消',
                    onClick: () => {
                        setResetPasswordDialogOpen(false);
                        setUserToResetPassword(null);
                    },
                }}
            />
        </Box>
    );
}
