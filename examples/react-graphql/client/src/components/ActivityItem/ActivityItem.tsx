import React from 'react'
import { Box, Heading, Text, Icon, Avatar, Button } from 'rimble-ui'
import * as Types from '../../types'
import { formatDistanceToNow } from 'date-fns'

import './ActivityItem.css'

interface Props {
  /**
   * The unique id or message hash
   */
  id: string

  /**
   * The message type
   */
  type: 'w3c.vp' | 'w3c.vc' | 'sdr' | string

  /**
   * The timestamp for when this message was recieved or sent
   */
  date: string
  /**
   * The activity that is taking place
   */
  activity?: string

  /**
   * The viewer's did
   */
  viewerDid: string

  /**
   * The issuer of this message item
   */
  from: Types.Identity

  /**
   * The subject
   */
  showRequest: () => void
  to: Types.Identity
  attachments: any
  renderAttachments?: (attachmentItem: any, itemIndex: number) => React.ReactNode
}

const Component: React.FC<Props> = ({
  attachments,
  renderAttachments,
  from,
  to,
  type,
  showRequest,
  date,
}) => {
  return (
    <Box className={'message_item'} p={3}>
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
        <Avatar size={'50'} src="https://airswap-token-images.s3.amazonaws.com/DAI.png" />
        <Box ml={2}>
          {type == 'sdr' ? (
            <Text>
              <b>{from.shortId}</b> requested information from <b>you</b>
            </Text>
          ) : type == 'w3c.vc' ? (
            <Text>
              <b>{from.did === to?.did ? 'You' : from.shortId}</b> issued a credential to
              <b> {to ? to.shortId : 'yourself'}</b>
            </Text>
          ) : (
            <Text>
              <b>You</b> shared credentials with <b>{to ? to.shortId : 'yourself'}</b>
            </Text>
          )}
        </Box>
      </Box>
      <Box ml={2} flexDirection={'row'} display={'flex'} py={2}>
        <Icon name={'Alarm'} color={'#555555'} mr={2} />
        <Text color={'#555555'}>{formatDistanceToNow(Date.parse(date)) + ' ago'}</Text>
      </Box>
      {type == 'sdr' && (
        <Box p={3}>
          <Button size={'medium'} onClick={showRequest}>
            Show Request
          </Button>
        </Box>
      )}
      {attachments && attachments.length > 0 && renderAttachments && (
        <Box p={3} pl={4}>
          {attachments.map((item: any, itemIndex: number) => {
            return renderAttachments(item, itemIndex)
          })}
        </Box>
      )}
    </Box>
  )
}

export default Component
