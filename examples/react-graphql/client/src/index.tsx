import React from 'react'
import ReactDOM from 'react-dom'
import Layout from './layout/Layout'
import * as serviceWorker from './serviceWorker'
import { BaseStyles, theme, ToastMessage } from 'rimble-ui'
import { ThemeProvider } from 'styled-components'
import { AppProvider } from './context/AppProvider'
import { GraphQLProvider } from './context/GraphQLProvider'

import '../src/styles/base.css'

ReactDOM.render(
  <AppProvider>
    <GraphQLProvider>
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
          <ToastMessage.Provider ref={(node: any) => (window.toastProvider = node)} />
          <Layout />
        </BaseStyles>
      </ThemeProvider>
    </GraphQLProvider>
  </AppProvider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
