import React from 'react'
import { Box, Heading } from 'rimble-ui'
import Page from '../../layout/Page'
import Avatar from '../../components/Avatar/Avatar'
import * as queries from '../../gql/queries'
import { useQuery, useLazyQuery } from 'react-apollo'
import * as Types from '../../types'
import Panel from '../../components/Panel/Panel'

const Component = () => {
  const { loading, data } = useQuery(queries.allIdentities)

  console.log(data?.identities)

  return (
    <Page title={'Connections'}>
      {/* <Avatar did={'ethr:did:0x145'} type={'circle'} size={60} /> */}

      <Box p={3}>
        <Panel heading={'Known identities'}>
          <Box>
            {data?.identities?.map((id: Types.Identity) => {
              return (
                <Box
                  className={'identity_row'}
                  key={id.did}
                  mb={2}
                  py={2}
                  flexDirection={'row'}
                  flex={1}
                  display={'flex'}
                  alignItems={'center'}
                >
                  <Box ml={3}>
                    <Avatar did={id.did} source={id.profileImage} type={'circle'} highlight={id.isManaged} />
                  </Box>
                  <Box ml={3}>{id.shortId}</Box>
                  <Box ml={3}>{id.isManaged && '(You manage this identity)'}</Box>
                </Box>
              )
            })}
          </Box>
        </Panel>
      </Box>
    </Page>
  )
}

export default Component
