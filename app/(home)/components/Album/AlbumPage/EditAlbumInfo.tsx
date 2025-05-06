'use client'

import { useState, useEffect } from 'react'
import { FormControlLabel, Switch } from '@mui/material'
import { mutate } from 'swr'
import FormDialog from '@/app/(home)/components/Dialog/FormDialog'
import ConfirmDialog from '@/app/(home)/components/Dialog/ConfirmDialog'
import { tagsFormater } from '@/lib/fetcher/fetchers'

interface EditAlbumProps {
  isOpen: boolean
  onClose: () => void
  album: {
    id: number
    name: string
    tags: string[]
    isPrivate: boolean
  }
  onSuccess?: () => void
}

export default function EditAlbumInfo({ isOpen, onClose, album, onSuccess }: EditAlbumProps) {
  const [isPrivate, setIsPrivate] = useState(false)
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false)

  // 初始化表单
  useEffect(() => {
    if (album) {
      setIsPrivate(album.isPrivate)
    }
  }, [album, isOpen])


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
  const [responseError, setResponseError] = useState<string>('')
  const handleSubmit = async (data: any) => {
    if (!album) return
    try {
      const response = await fetch(`/api/my/albums/${album.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          tags: tagsFormater(data.tags),
          isPrivate,
        }),
      })
      if (!response.ok) {
        setResponseError('编辑失败')
      }
      if (onSuccess) {
        mutate(`/api/albums/${album.id}`)
        onSuccess()
      }
      onClose()
    } catch (error) {
      throw error
    }
  }

  const albumFields = [
    {
      name: 'name',
      label: '图集名称',
      type: 'text',
      required: true,
      defaultValue: album?.name || '',
      validation: {
        pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
        error: '图集名称只能包含中英文、数字、非连续空格和横杠'
      }
    },
    {
      name: 'tags',
      label: '标签',
      type: 'text',
      required: true,
      defaultValue: album?.tags.join(' '),
      placeholder: '请输入图片标签,用空格分隔',
      validation: {
        pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
        error: '标签只能包含中英文、数字、非连续空格和横杠'
      }
    }
  ]

  return (
    <>
      <FormDialog
        title="编辑图集信息"
        isOpen={isOpen}
        onClose={onClose}
        fields={albumFields}
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
        content="设为私密后，只有您可以看到这个图集。确定要设为私密吗？"
        primaryButton={{ text: '确定', onClick: handleConfirmPrivacy }}
        secondaryButton={{ text: '取消', onClick: () => setShowPrivacyConfirm(false) }}
      />
    </>
  )
}
