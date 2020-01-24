import React from 'react'
import { Box, Heading, Text, Icon, Avatar, QR } from 'rimble-ui'
import * as Types from '../../types'

import './Credential.css'

interface Props {
  iss: Types.Identity
  sub: Types.Identity
  onClick?: () => void
  fields: Types.Field[]
  detailMode?: Boolean
  jwt?: string
}

const Component: React.FC<Props> = ({ onClick, detailMode, fields, jwt, iss, sub }) => {
  const detail = detailMode
    ? {}
    : { maxWidth: 350, style: { cursor: 'pointer' }, className: 'credential_hover' }

  return (
    <Box {...detail} border={1} borderRadius={5} borderColor={'#555555'} p={3} mb={16} onClick={onClick}>
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
        <Avatar size={'40'} src={''} />
        <Box ml={2}>
          <Text fontWeight={'bold'}>{iss.shortId}</Text>
          <Box flexDirection={'row'} display={'flex'}>
            <Icon name={'PlayArrow'} />
            <Text>{sub.shortId}</Text>
          </Box>
        </Box>
      </Box>
      <Box mt={detailMode ? 30 : 16}>
        {fields.map((field: any, i: number) => {
          const fieldValueImage = !field.isObj
            ? field.value.endsWith('.jpg') || field.value.endsWith('.png')
            : false
          return (
            <Box mb={1} key={i}>
              <Box>
                <Text>{field.type}</Text>
              </Box>
              <Box justifyContent={'flex-start'}>
                {fieldValueImage ? (
                  <Box paddingTop={5}>
                    <Avatar source={{ uri: field.value }} type={'rounded'} gravatarType={'retro'} size={25} />
                  </Box>
                ) : (
                  <Text>{field.isObj ? 'Type not supported yet' : field.value}</Text>
                )}
              </Box>
            </Box>
          )
        })}
        {!detailMode && fields.length > 2 && (
          <Box>
            <Text>...</Text>
          </Box>
        )}
        {detailMode && jwt && (
          <Box mt={50} alignItems={'center'} justifyContent={'center'} display={'flex'}>
            <QR size={300} value={jwt} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Component
