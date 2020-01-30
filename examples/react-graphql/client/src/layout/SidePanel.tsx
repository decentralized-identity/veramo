import React, { useEffect, useContext } from 'react'
import { Box, Heading, Icon } from 'rimble-ui'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { AppContext } from '../context/AppProvider'

interface Props {
  title: string
  closeUrl: string
  query?: any
  renderQuery?: (props: any, close: () => void) => React.ReactNode
}

const Component: React.FC<Props> = ({ title, closeUrl, query, children, renderQuery }) => {
  const [appState] = useContext(AppContext)
  const history = useHistory()
  const { id } = useParams()

  const [getQuery, { loading, data }] = useLazyQuery(query, {
    variables: { id, defaultDid: appState.defaultDid },
  })

  const close = () => {
    history.push(closeUrl)
  }

  useEffect(() => {
    if (renderQuery) {
      getQuery()
    }
  }, [id])

  return (
    <Box width={450} bg="#1C1C1C" borderLeft={1} borderColor={'#4B4B4B'}>
      <Box
        p={3}
        borderColor={'#4B4B4B'}
        flexDirection={'row'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        bg="#222222"
      >
        <Heading as={'h4'}>{title}</Heading>
        <Icon name={'Close'} onClick={close} style={{ cursor: 'pointer' }} />
      </Box>

      {renderQuery && data && (
        <Box p={3} pb={64} className={'scroll-container'}>
          {renderQuery(data, close)}
        </Box>
      )}

      {children && (
        <Box p={3} pb={64} className={'scroll-container'}>
          {children}
        </Box>
      )}
    </Box>
  )
}

export default Component
