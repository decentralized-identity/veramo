import React from 'react'
import { Box, Heading, Text, Icon, Avatar, Button } from 'rimble-ui'
import * as Types from '../../types'

import './MessageItem.css'

interface Props {
  /**
   * The activity that is takaing place
   */
  activity?: string

  /**
   * The type of message
   */
  type: string

  /**
   * The issuer of this message item
   */
  sender: Types.Identity

  /**
   * The subject
   */
  showRequest: () => void
  receiver: Types.Identity
  attachments: any
  renderAttachments?: (attachmentItem: any, itemIndex: number) => React.ReactNode
}

const Component: React.FC<Props> = ({
  attachments,
  renderAttachments,
  sender,
  receiver,
  type,
  showRequest,
}) => {
  return (
    <Box className={'message_item'} p={3}>
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
        <Avatar size={'50'} src="https://airswap-token-images.s3.amazonaws.com/DAI.png" />
        <Box ml={2}>
          {type == 'sdr' ? (
            <Text>
              <b>{sender.shortId}</b> requested information from <b>you</b>
            </Text>
          ) : type == 'w3c.vc' ? (
            <Text>
              <b>{sender.did === receiver?.did ? 'You' : sender.shortId}</b> issued a credential to
              <b> {receiver ? receiver.shortId : 'yourself'}</b>
            </Text>
          ) : (
            <Text>
              <b>You</b> shared credentials with <b>{receiver ? receiver.shortId : 'yourself'}</b>
            </Text>
          )}
        </Box>
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
