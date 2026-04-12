'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const RoleSelect = ({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) => {
  return (
    <>
      <input type="hidden" name="role" value={value} />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select role..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="content_admin">Content Admin</SelectItem>
          <SelectItem value="sme_reviewer">SME Reviewer</SelectItem>
          <SelectItem value="developer">Developer</SelectItem>
          <SelectItem value="ceo">CEO</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
