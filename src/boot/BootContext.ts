import { createContext, useContext } from 'react'

/** True while the first-load boot overlay covers the site. */
export const BootContext = createContext(false)

export const useBooting = (): boolean => useContext(BootContext)
