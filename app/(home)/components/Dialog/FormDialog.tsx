'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography } from '@mui/material'
import { useState, useEffect } from 'react'


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
    onSubmit: (data: any) => void
    externalError?: string // 外部错误(例如api响应：上传失败)
    children?: React.ReactNode
}

export default function FormDialog({
    title,
    onClose,
    isOpen,
    fields,
    onSubmit,
    externalError,
    children,
}: FormDialogProps) {
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        return fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.defaultValue || ''
        }), {})
    })
    const [errors, setErrors] = useState<Record<string, string>>(() => {
        return fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: ''
        }), {})
    })

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
            setErrors({
                ...errors,
                [field.name]: '这个字段是必须的'
            })
            return false
        }
        if (field.validation) {
            if (!field.validation.pattern.test(formData[field.name])) {
                setErrors({
                    ...errors,
                    [field.name]: field.validation.error
                })
                return false
            }
        }
        setErrors({
            ...errors,
            [field.name]: ''
        })
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const canSubmit = fields.map(checkValidation).filter(bool => !bool).length === 0
        if (!canSubmit) return
        onSubmit(formData)
        if (externalError) return
        onClose()
    }
    const handleClose = () => {
        setFormData({})
        setErrors({})
        onClose()
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
                                                name={field.name}
                                                onChange={handleChange}
                                                required={field.required}
                                                style={{ display: 'none' }}
                                                id={`file-${field.name}`}
                                                accept="image/*"
                                            />
                                            <label htmlFor={`file-${field.name}`}>
                                                <Button
                                                    variant="outlined"
                                                    component="span"
                                                    fullWidth
                                                >
                                                    {formData[field.name] ? formData[field.name].name : '选择图片'}
                                                </Button>
                                            </label>
                                            {errors[field.name] && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors[field.name]}
                                                </p>
                                            )}
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
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            error={!!errors[field.name]}
                                            helperText={errors[field.name]}
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
                        onClick={handleClose}
                    >
                        取消
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                    >
                        提交
                    </Button>
                </DialogActions>
            </form>
            {externalError && (
                <DialogContent>
                    <Typography color="error" align='center'>{externalError}</Typography>
                </DialogContent>
            )}
        </Dialog>
    )
}