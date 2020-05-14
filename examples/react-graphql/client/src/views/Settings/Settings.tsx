import React, { useContext, useState } from 'react'
import { Box, Heading, Input, Field, Button, Flex, Form } from 'rimble-ui'
import Page from '../../layout/Page'
import Avatar from '../../components/Avatar/Avatar'
import * as Types from '../../types'
import Panel from '../../components/Panel/Panel'
import { AppContext } from '../../context/AppProvider'

const Component = () => {
  const { appState, setApiKey, setApiUrl } = useContext(AppContext)
  const [ newApiKey, setNewApiKey ] = useState(appState.apiKey)
  const [ newApiUrl, setNewApiUrl ] = useState(appState.apiUrl)

  const handleSave = () => {
    setApiKey(newApiKey)
    setApiUrl(newApiUrl)
  }

  return (
    <Page title={'Settings'}>

      <Box p={3}>
        <Panel heading={'API details'}>


          <Flex mx={-3} flexWrap={'wrap'}>
            <Box width={1} px={3}>

              <Field label="API URL">
                <Input
                  border={0}
                  type="text"
                  required
                  backgroundColor={'#313131'}
                  value={newApiUrl}
                  onChange={(e: any) => setNewApiUrl(e.target.value)}
                />
              </Field>
            </Box>
          </Flex>

          <Flex mx={-3} flexWrap={'wrap'}>
            <Box width={1} px={3}>

              <Field label="API Key">
                <Input
                  border={0}
                  type="text"
                  required
                  backgroundColor={'#313131'}
                  value={newApiKey}
                  onChange={(e: any) => setNewApiKey(e.target.value)}
                />
              </Field>
              </Box>
          </Flex>
 
        </Panel>
        <Button onClick={handleSave}>Save</Button>
      </Box>
    </Page>
  )
}

export default Component
