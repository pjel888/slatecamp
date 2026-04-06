export const getNotesList = async () => []

export const getNote = async (_id: string) => null

export const createNote = async () => ({ id: 'storybook-note' })

export const updateNote = async () => ({})

export const createNoteFolder = async (_name: string) => ({
  id: 'storybook-folder',
  name: 'Storybook Folder',
})

export const deleteNote = async (_id: string) => ({})

export const getNoteFolders = async () => []
