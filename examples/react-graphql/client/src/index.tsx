import React from 'react'
import ReactDOM from 'react-dom'
import Layout from './layout/Layout'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import * as serviceWorker from './serviceWorker'
import { BaseStyles, theme } from 'rimble-ui'
import { ThemeProvider } from 'styled-components'

import '../src/styles/base.css'

const client = new ApolloClient({
  uri: 'http://localhost:4000/',

  // Authorization is out of scope for this example,
  // but this is where you could add your auth logic
  request: operation => {
    const token = 'hardcoded-example-token'
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    })
  },
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeProvider
      theme={Object.assign({}, theme, {
        colors: {
          ...theme.colors, // keeps existing colors
          text: '#EEE', // sets color for text
          background: '#222', // sets color for background
          primary: '#3259D6', // sets primary color
        },
        fontSizes: [12, 14, 16, 20, 24, 32, 48, 64], // sets font scale
        space: [0, 4, 8, 16, 32, 64, 128, 256], // sets spacing scale
      })}
    >
      <BaseStyles id="base_styles_container">
        <Layout />
      </BaseStyles>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
