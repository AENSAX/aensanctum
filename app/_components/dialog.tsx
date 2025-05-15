'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import React from 'react';

//确认对话框
interface ButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
}

interface ConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    primaryButton?: ButtonProps;
    secondaryButton?: ButtonProps;
    externalError?: { field: string; message: string }[]; // 外部错误(例如api响应：上传失败)
}

export function ConfirmDialog({
    isOpen,
    onClose,
    title,
    content,
    primaryButton,
    secondaryButton,
    externalError,
}: ConfirmProps) {
    if (!primaryButton && !secondaryButton) {
        throw new Error('At least one button must be provided');
    }
    const [errors, setErrors] = useState<{ field: string; message: string }[]>(
        [],
    );
    const handlePrimaryButtonClick = async () => {
        await primaryButton?.onClick();
        if (externalError) {
            setErrors(externalError);
        }
    };
    const handleSecondaryButtonClick = async () => {
        await secondaryButton?.onClick();
        if (externalError) {
            setErrors(externalError);
        }
    };
    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>

            <DialogContent>{content}</DialogContent>

            <DialogActions>
                {secondaryButton && (
                    <Button
                        onClick={handleSecondaryButtonClick}
                        variant={'contained'}
                        disabled={secondaryButton.disabled}
                    >
                        {secondaryButton.text}
                    </Button>
                )}

                {primaryButton && (
                    <Button
                        onClick={handlePrimaryButtonClick}
                        variant={'contained'}
                        disabled={primaryButton.disabled}
                    >
                        {primaryButton.text}
                    </Button>
                )}
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

type FieldType = {
    file: File;
    text: string;
    number: number;
    flag: boolean;
};

type FieldDeclaration<Typ extends keyof FieldType> = {
    label: string;
    type: Typ;
    required: boolean;
    defaultValue?: FieldType[Typ];
    placeholder?: string;
    validator?: (val?: FieldType[Typ]) => null | string; // null for valid, string for invalid and helper text
};

type Base = {
    [key: string]: keyof FieldType;
};

type FormFields<T extends Base> = {
    [K in keyof T]: FieldDeclaration<T[K]>;
};

type FormValue<T extends Base> = {
    [K in keyof T]?: FieldType[T[K]];
};

type FormDialogProps<T extends Base> = {
    title: string;
    onClose: () => void;
    isOpen: boolean;
    fields: FormFields<T>;
    onSubmit: (data: FormValue<T>) => Promise<void>;
    onComplete?: () => void;
    externalError?: { field: string; message: string }[]; // 外部错误(例如api响应：上传失败)
    // TODO: consider removing `externalError`

    children?: React.ReactNode;
};

export function FormDialog<T extends Base>({
    title,
    onClose,
    isOpen,
    fields,
    onSubmit,
    onComplete,
    externalError,
    children,
}: FormDialogProps<T>) {
    const [formData, setFormData] = useState<FormValue<T>>(() => {
        const val: FormValue<T> = {};
        for (const item in fields) {
            val[item] = fields[item].defaultValue;
        }
        return val;
    });
    const [errors, setErrors] = useState<{ field: string; message: string }[]>(
        [],
    );
    const [disabled, setDisabled] = useState(false);

    // 监听 fields 的变化，更新 formData
    useEffect(() => {
        const val: FormValue<T> = {};
        for (const item in fields) {
            val[item] = fields[item].defaultValue;
        }
        setFormData(val);
    }, [fields]);

    const validate = () => {
        for (const key in fields) {
            if (fields[key].validator === undefined) {
                continue;
            }

            const result = fields[key].validator(formData[key]);

            if (result === null) {
                continue;
            }

            setErrors([
                {
                    field: key,
                    message: result,
                },
            ]);
            return false;
        }
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type } = e.target;

        switch (type) {
            case 'file': {
                const file = e.target.files?.[0];
                setFormData({
                    ...formData,
                    [name]: file,
                });
                break;
            }
            case 'text': {
                const { value } = e.target;
                setFormData({
                    ...formData,
                    [name]: value,
                });
                break;
            }
            default: {
                break;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;
        setDisabled(true);
        await onSubmit(formData);
        setDisabled(false);
        if (externalError && externalError.length > 0) {
            setErrors(externalError);
            return;
        }
        onComplete?.();
        setFormData({});
        setErrors([]);
        onClose();
    };
    const handleClose = () => {
        onClose();
        setFormData({});
        setErrors([]);
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{title}</DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        {Object.keys(fields).map((x) => {
                            const name = x as keyof T;
                            const field = fields[name];

                            switch (field.type) {
                                case 'file':
                                    return (
                                        <div key={x}>
                                            <input
                                                type="file"
                                                readOnly={disabled}
                                                name={x}
                                                onChange={handleChange}
                                                required={field.required}
                                                style={{ display: 'none' }}
                                                id={`file-${x}`}
                                                accept="image/*"
                                            />
                                            <label htmlFor={`file-${x}`}>
                                                <Button
                                                    disabled={disabled}
                                                    variant="outlined"
                                                    component="span"
                                                    fullWidth
                                                >
                                                    {formData[
                                                        name
                                                    ]?.toString() ?? '选择图片'}
                                                </Button>
                                            </label>
                                        </div>
                                    );
                                case 'text':
                                    return (
                                        <TextField
                                            key={x}
                                            type="text"
                                            name={x}
                                            label={field.label}
                                            value={formData[name] || ''}
                                            disabled={disabled}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            fullWidth
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })}
                        {children}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button disabled={disabled} onClick={handleClose}>
                        取消
                    </Button>
                    <Button
                        disabled={disabled}
                        type="submit"
                        variant="contained"
                    >
                        提交
                    </Button>
                </DialogActions>
            </form>
            {errors &&
                errors.map((error) => (
                    <Alert key={error.field} severity="error" sx={{ mt: 2 }}>
                        {error.message}
                    </Alert>
                ))}
        </Dialog>
    );
}
