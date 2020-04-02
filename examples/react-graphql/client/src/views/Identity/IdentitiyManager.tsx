import React, { useState, useEffect, useContext } from 'react'
import { Flex, Box, Text, Heading, Button, Icon, Table, Field, Input } from 'rimble-ui'
import Page from '../../layout/Page'
import Panel from '../../components/Panel/Panel'
import Avatar from '../../components/Avatar/Avatar'
import { useHistory, useRouteMatch, useParams } from 'react-router-dom'
import * as queries from '../../queries'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { AppContext } from '../../context/AppProvider'

const Component = () => {
  const history = useHistory()
  const { url } = useRouteMatch()
  const [highlightedIdentity, highlightIdentity] = useState()
  const [appState, setDefaultDid] = useContext(AppContext)
  const { defaultDid } = appState
  const { data: managedIdentitiesData } = useQuery(queries.managedIdentities)
  const [createIdentity] = useMutation(queries.createIdentity, {
    refetchQueries: [{ query: queries.managedIdentities }],
  })

  const showIdentityDetail = (did: string) => {
    highlightIdentity(did)

    history.push(`${url}/user/${did}`)
  }

  console.log(appState)

  useEffect(() => {
    if (!defaultDid && managedIdentitiesData?.managedIdentities?.length > 0) {
      setDefaultDid(managedIdentitiesData.managedIdentities[0].did)
    }
  }, [managedIdentitiesData])

  return (
    <Page title={'Identity Manger'} padding={3}>
      <Panel
        heading={'Managed DIDs'}
        headerBorder={0}
        headerRight={
          <Box>
            <Button
              icononly
              icon={'Add'}
              size={'small'}
              onClick={() => createIdentity({ variables: { type: 'rinkeby-ethr-did' } })}
            ></Button>
          </Box>
        }
      >
        <Table border={0} color={'#FFFFFF'} borderColor={'#4B4B4B'}>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>DID</th>
              <th>Provider</th>
              <th>Short ID</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {managedIdentitiesData?.managedIdentities?.map(
              (identity: {
                did: string
                provider: string
                shortId: string
                name: string
                profileImage?: string
              }) => {
                return (
                  <tr
                    key={identity.did}
                    className={`interactive_table_row ${
                      highlightedIdentity === identity.did ? 'highlighted' : ''
                    }`}
                    onClick={() => showIdentityDetail(identity.did)}
                  >
                    <td>
                      <Avatar did={identity.did} source={identity.profileImage} type={'circle'} />
                    </td>
                    <td>{identity.did}</td>
                    <td>{identity.provider}</td>
                    <td>{identity.shortId}</td>
                    <td className={'icon_cell'}>
                      {defaultDid === identity.did && <Icon name={'Check'} color={'green'} />}
                    </td>
                  </tr>
                )
              },
            )}
          </tbody>
        </Table>
        <Box pl={4}>
          {managedIdentitiesData?.identityProviders?.map(
            (provider: { type: string; description: string }) => (
              <Button
                mt={3}
                mb={3}
                mr={3}
                key={provider.type}
                onClick={() => createIdentity({ variables: { type: provider.type } })}
              >
                Create {provider.type} DID
              </Button>
            ),
          )}
        </Box>
      </Panel>
    </Page>
  )
}

export default Component
