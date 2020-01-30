import React, { useState, createContext } from 'react'

export const AppContext = createContext<AppState | any>({})

interface AppState {
  defaultDid: string
}

export const AppProvider = (props: any) => {
  const defaultDid = localStorage.getItem('defaultId') || ''

  const [appState, setGlobalState] = useState<AppState>({
    defaultDid: defaultDid,
  })

  const setDefaultDid = (did: string) => {
    localStorage.setItem('defaultId', did)

    const newState = {
      ...appState,
      defaultDid: did,
    }

    setGlobalState(newState)
  }

  return <AppContext.Provider value={[appState, setDefaultDid]}>{props.children}</AppContext.Provider>
}
