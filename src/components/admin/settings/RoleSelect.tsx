'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const RoleSelect = () => {
  const [value, setValue] = useState('')

  return (
    <>
      <input type="hidden" name="role" value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select role..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="content_admin">Content Admin</SelectItem>
          <SelectItem value="sme_reviewer">SME Reviewer</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
