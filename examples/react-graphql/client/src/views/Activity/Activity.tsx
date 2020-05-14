import React, { useContext, useState } from 'react'
import { Flex } from 'rimble-ui'
import ActivityItem from '../../components/ActivityItem/ActivityItem'
import Page from '../../layout/Page'
import Credential from '../../components/Credential/Credential'
import * as queries from '../../gql/queries'
import { AppContext } from '../../context/AppProvider'
import { useQuery } from '@apollo/react-hooks'
import { useHistory, useRouteMatch } from 'react-router-dom'

interface Activity {}

const Activity: React.FC<Activity> = () => {
  const { appState } = useContext(AppContext)
  const history = useHistory()
  const { url } = useRouteMatch()

  const { data } = useQuery(queries.allMessages, {
    variables: { activeDid: appState.defaultDid },
  })

  return (
    <Page title={'Activity'}>
      <h2>Received messages</h2>
      {data?.receivedMessages?.map((msg: any) => (
        <ActivityItem
          viewerDid={appState.defaultDid}
          id={msg.id}
          date={msg.createdAt}
          type={msg.type}
          key={msg.id}
          from={msg.from}
          to={msg.to}
          showRequest={() => history.push(`${url}/sdr/${msg.id}`)}
          attachments={msg.credentials}
          renderAttachments={(attachment: any) => (
            <Credential
              issuer={attachment.issuer}
              subject={attachment.subject}
              key={attachment.hash}
              onClick={() => history.push(`${url}/credential/${attachment.hash}`)}
              claims={attachment.claims}
            />
          )}
        />
      ))}

      <h2>Sent messages</h2>
      {data?.sentMessages?.map((msg: any) => (
        <ActivityItem
          viewerDid={appState.defaultDid}
          id={msg.id}
          date={msg.createdAt}
          type={msg.type}
          key={msg.id}
          from={msg.from}
          to={msg.to}
          showRequest={() => history.push(`${url}/sdr/${msg.id}`)}
          attachments={msg.credentials}
          renderAttachments={(attachment: any) => (
            <Credential
              issuer={attachment.issuer}
              subject={attachment.subject}
              key={attachment.hash}
              onClick={() => history.push(`${url}/credential/${attachment.hash}`)}
              claims={attachment.claims}
            />
          )}
        />
      ))}
    </Page>
  )
}

export default Activity
