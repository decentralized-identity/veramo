import React, { useContext } from 'react'
import { Flex, Box, Text, Heading, Button, Icon, Table, Field, Input, Card, Loader } from 'rimble-ui'
import Panel from '../../components/Panel/Panel'
import Page from '../../layout/Page'
import * as queries from '../../queries'
import { AppContext } from '../../context/AppProvider'
import { useQuery } from '@apollo/react-hooks'

interface Activity {}

const Activity: React.FC<Activity> = () => {
  const [appState] = useContext(AppContext)

  const { loading: messagesLoading, data: messagesData } = useQuery(queries.allMessages, {
    variables: { activeDid: appState.defaultDid },
  })

  console.log(messagesData)

  return (
    <Page title={'Activity'}>
      <Panel heading={'Messages'} headerBorder={0}>
        <Table border={0} color={'#FFFFFF'} borderColor={'#4B4B4B'}>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Time</th>
              <th>Type</th>
              <th>Claims</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {messagesData?.identity?.messagesAll?.map((msg: any) => (
              <tr key={msg.id}>
                <td>{msg.sender.shortId}</td>
                <td>{msg.receiver.shortId}</td>
                <td>{msg.timestamp}</td>
                <td>{msg.type}</td>
                <td>
                  {msg.vc?.map((vc: any) =>
                    vc.fields.map((field: any) => (
                      <div key={field.type}>
                        {field.type} = {field.value}
                      </div>
                    )),
                  )}
                </td>
                <td>
                  <Icon
                    name="Search"
                    size="30"
                    onClick={() => {
                      // setQrValue(msg.raw)
                      // setIsQROpen(true)
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </Page>
  )
}

export default Activity
