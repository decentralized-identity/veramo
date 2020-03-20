import { useContext, useState } from 'react'
import { Box, Button, Heading, Text } from 'rimble-ui'
import { WalletConnectContext } from '../components/WalletConnectContext'
import { core } from '../daf/setup'
import useSWR, { mutate } from 'swr'
import fetch from '../libs/fetch'

const Welcome = props => {
  const { killSession, address } = useContext(WalletConnectContext)
  // const initialData = props.data
  // const { data, revalidate } = useSWR('/api/identities', fetch, { initialData })

  // const createIdentity = async () => {
  //   await fetch('/api/identities?type=rinkebyEthrDid')
  //   revalidate()
  // }

  return <Text>{'loading'}</Text>
}

export default Welcome
