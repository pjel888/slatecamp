export const DEV_MODE_BORDER_STORAGE_KEY = 'slatecamp:dev-mode-border-visible'
export const DEV_MODE_BORDER_CHANGE_EVENT = 'slatecamp:dev-mode-border-change'

export function readDevModeBorderVisible(storage: Storage | undefined): boolean {
  if (!storage) return true
  return storage.getItem(DEV_MODE_BORDER_STORAGE_KEY) !== 'false'
}

export function writeDevModeBorderVisible(storage: Storage, visible: boolean) {
  storage.setItem(DEV_MODE_BORDER_STORAGE_KEY, String(visible))
}
