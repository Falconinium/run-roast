'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface InviteLinkSectionProps {
  inviteToken: string
}

export function InviteLinkSection({ inviteToken }: InviteLinkSectionProps) {
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${inviteToken}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter des participants</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          Partagez ce lien avec les personnes que vous souhaitez inviter au défi :
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
          />
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? 'Copié !' : 'Copier'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
