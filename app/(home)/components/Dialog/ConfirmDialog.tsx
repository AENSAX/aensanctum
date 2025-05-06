'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'

interface ButtonProps {
    text: string
    onClick: () => void
}

interface ConfirmProps {
    isOpen: boolean
    onClose: () => void
    title: string
    content: string
    primaryButton?: ButtonProps
    secondaryButton?: ButtonProps
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    title,
    content,
    primaryButton,
    secondaryButton
}: ConfirmProps) {

    if (!primaryButton && !secondaryButton) {
        throw new Error('At least one button must be provided')
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
                        onClick={secondaryButton.onClick}
                        variant={'contained'}
                    >
                        {secondaryButton.text}
                    </Button>
                )}

                {primaryButton && (
                    <Button
                        onClick={primaryButton.onClick}
                        variant={'contained'}
                    >
                        {primaryButton.text}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}