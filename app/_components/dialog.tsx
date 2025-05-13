'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography, Alert } from '@mui/material'
import { useState, useEffect } from 'react'

//确认对话框
interface ButtonProps {
    text: string
    onClick: () => void
    disabled?: boolean
}

interface ConfirmProps {
    isOpen: boolean
    onClose: () => void
    title: string
    content: string
    primaryButton?: ButtonProps
    secondaryButton?: ButtonProps
    externalError?: { field: string, message: string }[] // 外部错误(例如api响应：上传失败)
}

export function ConfirmDialog({
    isOpen,
    onClose,
    title,
    content,
    primaryButton,
    secondaryButton,
    externalError
}: ConfirmProps) {

    if (!primaryButton && !secondaryButton) {
        throw new Error('At least one button must be provided')
    }
    const [errors, setErrors] = useState<{ field: string, message: string }[]>([])
    const handlePrimaryButtonClick = async () => {
        await primaryButton?.onClick()
        if (externalError) {
            setErrors(externalError)
        }
    }
    const handleSecondaryButtonClick = async () => {
        await secondaryButton?.onClick()
        if (externalError) {
            setErrors(externalError)
        }
    }
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogTitle id="confirm-dialog-title">
                {title}
            </DialogTitle>

            <DialogContent>
                {content}
            </DialogContent>

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
            {errors && (
                errors.map((error) => (
                    <Alert key={error.field} severity="error" sx={{ mt: 2 }}>
                        {error.message}
                    </Alert>
                ))
            )}
        </Dialog>
    )
}

//表单对话框
interface Field {
    name: string
    label: string
    type: string
    required: boolean
    defaultValue?: string
    placeholder?: string
    validation?: {
        pattern: RegExp
        error: string
    }
}

interface FormDialogProps {
    title: string
    onClose: () => void
    isOpen: boolean
    fields: Field[]
    onSubmit: (data: any) => Promise<void>,
    onComplete?: () => void,
    externalError?: { field: string, message: string }[] // 外部错误(例如api响应：上传失败)
    children?: React.ReactNode
}

export function FormDialog({
    title,
    onClose,
    isOpen,
    fields,
    onSubmit,
    onComplete,
    externalError,
    children,
}: FormDialogProps) {
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        return fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.defaultValue || ''
        }), {})
    })
    const [errors, setErrors] = useState<{ field: string, message: string }[]>([])
    const [disabled, setDisabled] = useState(false);

    // 监听 fields 的变化，更新 formData
    useEffect(() => {
        const newFormData = fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.defaultValue || ''
        }), {})
        setFormData(newFormData)
    }, [fields])

    const checkValidation = (field: Field) => {
        if (field.required && !formData[field.name]) {
            setErrors([{
                field: field.name,
                message: '这个字段是必须的'
            }])
            return false
        }
        if (field.validation) {
            if (!field.validation.pattern.test(formData[field.name])) {
                setErrors([{
                    field: field.name,
                    message: field.validation.error
                }])
                return false
            }
        }
        setErrors(errors.filter(error => error.field !== field.name))
        return true
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type } = e.target

        switch (type) {
            case 'file': {
                const file = e.target.files?.[0]
                setFormData({
                    ...formData,
                    [name]: file
                })
                break
            }
            case 'text': {
                const { value } = e.target
                setFormData({
                    ...formData,
                    [name]: value
                })
                break
            }
            default: {
                break
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const canSubmit = fields.map(checkValidation).filter(bool => !bool).length === 0
        if (!canSubmit) return
        setDisabled(true);
        await onSubmit(formData)
        setDisabled(false);
        if (externalError && externalError.length > 0) {
            setErrors(externalError)
            return
        }
        onComplete?.();
        setFormData({})
        setErrors([])
        onClose()
    }
    const handleClose = () => {
        onClose()
        setFormData({})
        setErrors([])
    }

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>{title}</DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        {fields.map((field) => {
                            switch (field.type) {
                                case 'image':
                                    return (
                                        <div key={field.name}>
                                            <input
                                                type="file"
                                                readOnly={disabled}
                                                name={field.name}
                                                onChange={handleChange}
                                                required={field.required}
                                                style={{ display: 'none' }}
                                                id={`file-${field.name}`}
                                                accept="image/*"
                                            />
                                            <label htmlFor={`file-${field.name}`}>
                                                <Button
                                                    disabled={disabled}
                                                    variant="outlined"
                                                    component="span"
                                                    fullWidth
                                                >
                                                    {formData[field.name] ? formData[field.name].name : '选择图片'}
                                                </Button>
                                            </label>
                                        </div>
                                    )
                                case 'text':
                                    return (
                                        <TextField
                                            key={field.name}
                                            type={field.type}
                                            name={field.name}
                                            label={field.label}
                                            value={formData[field.name] || ''}
                                            disabled={disabled}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            fullWidth
                                        />
                                    )
                                default:
                                    return null
                            }
                        })}
                        {children}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        disabled={disabled}
                        onClick={handleClose}
                    >
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
            {errors && (
                errors.map((error) => (
                    <Alert key={error.field} severity="error" sx={{ mt: 2 }}>
                        {error.message}
                    </Alert>
                ))
            )}
        </Dialog>
    )
}