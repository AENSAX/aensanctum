'use client';

import { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
} from '@mui/material';
import { User, ErrorResponse } from '@/lib/interfaces/interfaces';

interface EditDialogProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (userData: Partial<User>) => Promise<void>;
}

export function EditUserDialog({
    open,
    onClose,
    user,
    onSave,
}: EditDialogProps) {
    const [name, setName] = useState(user?.name || '');
    const [isAdmin, setIsAdmin] = useState(user?.isAdmin || false);
    const [isActive, setIsActive] = useState(user?.isActive || false);
    const [errors, setErrors] = useState<{ field: string; message: string }[]>(
        [],
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setIsAdmin(user.isAdmin);
            setIsActive(user.isActive);
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave({
                name,
                isAdmin,
                isActive,
            });
            onClose();
        } catch (err: unknown) {
            if (err instanceof ErrorResponse) {
                setErrors(err.errors);
            }
        } finally {
            setLoading(false);
        }
    };
    const handleClose = () => {
        setErrors([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="用户名"
                    type="text"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                        />
                    }
                    label="管理员权限"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                    }
                    label="账户可用性"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                >
                    保存
                </Button>
            </DialogActions>
            {errors &&
                errors.map((error) => (
                    <Alert key={error.field} severity="error" sx={{ mt: 2 }}>
                        {error.message}
                    </Alert>
                ))}
        </Dialog>
    );
}
