import React from 'react'
import { Box, Heading, Text, Icon, Avatar } from 'rimble-ui'
import * as Types from '../../types'

import './MessageItem.css'

interface Props {
  /**
   * The activity that is takaing place
   */
  activity?: string

  /**
   * The issuer of this message item
   */
  sender: Types.Identity

  /**
   * The subject
   */
  receiver: Types.Identity
  attachments: any
  renderAttachments?: (attachmentItem: any, itemIndex: number) => React.ReactNode
}

const Component: React.FC<Props> = ({ attachments, renderAttachments, sender, receiver }) => {
  return (
    <Box className={'message_item'} p={3}>
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
        <Avatar size={'50'} src="https://airswap-token-images.s3.amazonaws.com/DAI.png" />
        <Box ml={2}>
          <Text>
            <b>{sender.shortId}</b> sent a message to <b>{receiver ? receiver.shortId : 'You'}</b>
          </Text>
        </Box>
      </Box>
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
