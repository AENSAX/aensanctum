'use client'

import { useState, useEffect } from 'react'
import { FormControlLabel, Switch } from '@mui/material'
import { mutate } from 'swr'
import FormDialog from '@/app/(home)/components/Dialog/FormDialog'
import ConfirmDialog from '@/app/(home)/components/Dialog/ConfirmDialog'
import { Picture } from '@/lib/interfaces/interfaces'
import { tagsFormater } from '@/lib/fetcher/fetchers'

interface EditPictureProps {
  isOpen: boolean
  onClose: () => void
  picture: Picture | null
  onSuccess?: () => void
}

export default function EditPicture({ isOpen, onClose, picture, onSuccess }: EditPictureProps) {
  const [isPrivate, setIsPrivate] = useState(false)
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false)
  const [responseError, setResponseError] = useState<string>('')

  // 初始化表单
  useEffect(() => {
    if (picture) {
      setIsPrivate(picture.isPrivate)
    }
  }, [picture, open])

  // 处理隐私设置变更
  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setShowPrivacyConfirm(true)
    } else {
      setIsPrivate(false)
    }
  }

  // 确认设置隐私
  const handleConfirmPrivacy = () => {
    setIsPrivate(true)
    setShowPrivacyConfirm(false)
  }

  // 处理提交
  const handleSubmit = async (data: any) => {
    if (!picture) return
    try {
      const response = await fetch(`/api/my/pictures/${picture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          tags: tagsFormater(data.tags),
          isPrivate,
        }),
      })
      if (!response.ok) {
        setResponseError('编辑失败')
        return
      }
      if (onSuccess) {
        mutate(`/api/pictures/${picture.id}`)
        onSuccess()
      }
      onClose()
    } catch (error) {
      throw error
    }
  }

  const pictureFields = [
    {
      name: 'title',
      label: '标题',
      type: 'text',
      required: true,
      defaultValue: picture?.title || '',
      validation: {
        pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
        error: '图片标题只能包含中英文、数字、非连续空格和横杠'
      }
    },
    {
      name: 'tags',
      label: '标签',
      type: 'text',
      required: false,
      defaultValue: picture?.tags.join(' '),
      placeholder: '请输入标签，用空格分隔',
      validation: {
        pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
        error: '标签只能包含中英文、数字、非连续空格和横杠'
      }
    }
  ]

  return (
    <>
      <FormDialog
        title="编辑图片信息"
        isOpen={isOpen}
        onClose={onClose}
        fields={pictureFields}
        onSubmit={handleSubmit}
        externalError={responseError}
      >
        <FormControlLabel
          control={
            <Switch
              checked={isPrivate}
              onChange={handlePrivacyChange}
              color="primary"
            />
          }
          label="设为私密"
        />
      </FormDialog>

      <ConfirmDialog
        isOpen={showPrivacyConfirm}
        onClose={() => setShowPrivacyConfirm(false)}
        title="确认设为私密"
        content="设为私密后，只有您可以看到这张图片。确定要设为私密吗？"
        primaryButton={{ text: '确定', onClick: handleConfirmPrivacy }}
        secondaryButton={{ text: '取消', onClick: () => setShowPrivacyConfirm(false) }}
      />
    </>
  )
}