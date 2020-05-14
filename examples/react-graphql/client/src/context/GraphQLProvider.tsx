import React, { useContext } from 'react'
import { ApolloProvider } from 'react-apollo'
import ApolloClient from 'apollo-boost'
import { AppContext } from './AppProvider'


export const GraphQLProvider = (props: any) => {
  
  const { appState } = useContext(AppContext)

  const client = new ApolloClient({
    uri: appState.apiUrl,
  
    // Authorization is out of scope for this example,
    // but this is where you could add your auth logic
    request: operation => {
      const token = appState.apiKey
      operation.setContext({
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
    },
  })
  


  return <ApolloProvider client={client}>{props.children}</ApolloProvider>
}
