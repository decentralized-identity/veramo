import React, { useState, createContext } from 'react'

export interface IAppContext {
  appState: AppState
  setDefaultDid: (defaultDid: string) => void
  setApiKey: (apiKey: string) => void
  setApiUrl: (apiUrl: string) => void
}

export const AppContext = createContext<IAppContext>({
  appState: {
    defaultDid: '',
    apiUrl: '',
    apiKey: ''
  },
  setDefaultDid: (defaultDid: string) => {},
  setApiKey: (apiKey: string) => {},
  setApiUrl: (apiUrl: string) => {}
})

interface AppState {
  defaultDid: string
  apiUrl: string
  apiKey: string
}

export const AppProvider = (props: any) => {
  const defaultDid = localStorage.getItem('defaultId') || ''
  const apiUrl = localStorage.getItem('apiUrl') || 'http://localhost:4000/'
  const apiKey = localStorage.getItem('apiKey') || 'hardcoded-example-token'

  const [appState, setGlobalState] = useState<AppState>({
    defaultDid,
    apiKey,
    apiUrl
  })

  const setDefaultDid = (defaultDid: string) => {
    localStorage.setItem('defaultId', defaultDid)

    const newState = {
      ...appState,
      defaultDid,
    }

    setGlobalState(newState)
  }

  const setApiUrl = (apiUrl: string) => {
    localStorage.setItem('apiUrl', apiUrl)

    const newState = {
      ...appState,
      apiUrl,
    }

    setGlobalState(newState)
  }

  const setApiKey = (apiKey: string) => {
    localStorage.setItem('apiKey', apiKey)

    const newState = {
      ...appState,
      apiKey,
    }

    setGlobalState(newState)
  }


  return <AppContext.Provider value={{
    appState,
    setDefaultDid,
    setApiKey,
    setApiUrl
  }}>{props.children}</AppContext.Provider>
}
