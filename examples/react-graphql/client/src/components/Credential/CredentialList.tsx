import React from 'react'
import * as Types from '../../types'
import Credential from './Credential'
import { Box, Heading, Text } from 'rimble-ui'
import './Credential.css'
import * as queries from '../../gql/queries'
import { useQuery } from 'react-apollo'
import { useParams } from 'react-router-dom'

const S = require('sugar/string')

interface Props {}

const Component: React.FC<Props> = ({}) => {
  const { id } = useParams()
  const { data } = useQuery(queries.credentials, { variables: { id } })

  return (
    <Box>
      <Heading as={'h3'} mt={2} mb={3}>
        Credentials
      </Heading>
      {data &&
        data.credentials &&
        data.credentials.map((credential: any) => {
          return (
            <Credential
              key={credential.hash}
              issuer={credential.issuer}
              subject={credential.subject}
              claims={credential.claims}
              jwt={credential.jwt}
            />
          )
        })}
    </Box>
  )
}

export default Component
