import React from 'react'
import { Flex, Box, Text, Heading, Button, Icon, Table, Field, Input } from 'rimble-ui'
import Page from '../../layout/Page'
import Panel from '../../components/Panel/Panel'
import { useHistory, useRouteMatch, useParams } from 'react-router-dom'

const identities = [
  {
    did: 'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0xd24400ae8bfebb18ca49be86258a3c749cf46853',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0x4f509786981ed37a6b2c693d75dfd0202a4bfb57',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0xcd959e71449425f6e4ac814b7f5aebde93012e24',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0xc257274276a4e539741ca11b590b9447b26a8051',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0x64db1b94a0304e4c27de2e758b2f962d09dfe503',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0xc257274276a4e539741ca11b590b9447b26a8051',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0x2140efd7ba31169c69dfff6cdc66c542f0211825',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0xc257274276a4e539741ca11b590b9447b26a8051',
    name: 'Jack Sparrow',
  },
  {
    did: 'did:ethr:0xc257274276a4e539741ca11b590b9447b26a8051',
    name: 'Jack Sparrow',
  },
]

const Component = () => {
  let history = useHistory()
  let { url } = useRouteMatch()
  let { id } = useParams()

  return (
    <Page title={'Identity Manger'}>
      <Panel
        heading={'Managed DIDs'}
        headerBorder={0}
        headerRight={
          <Box>
            <Button icononly icon={'Search'} size={'small'} mr={1}></Button>
            <Button icononly icon={'Add'} size={'small'}></Button>
          </Box>
        }
      >
        <Table border={0} color={'#FFFFFF'} borderColor={'#4B4B4B'}>
          <thead>
            <tr>
              <th>DID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {identities.map(identity => {
              const isSelected = identity.did === id
              return (
                <tr
                  key={identity.did}
                  className={`interactive_table_row ${isSelected ? 'selected' : ''}`}
                  onClick={() => history.push(`${url}/${identity.did}`)}
                >
                  <td>{identity.did}</td>
                  <td>ethr-did-fs</td>
                  <td>{identity.name}</td>
                  <td>Jack</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Panel>
    </Page>
  )
}

export default Component
