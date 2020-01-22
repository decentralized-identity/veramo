import React from 'react'
import { Box, Heading, Field, Input, Icon, Flash } from 'rimble-ui'
import { useParams, useHistory } from 'react-router-dom'

const Component = () => {
  let { id } = useParams()
  let history = useHistory()

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
        <Heading as={'h4'}>Identity</Heading>
        <Icon name={'Close'} onClick={() => history.push('/identities')} />
      </Box>
      <Box p={3} pb={64} className={'scroll-container'}>
        <Flash my={3} variant="info">
          {id}
        </Flash>

        <Box borderRadius={1} bg="#222222" mb={32}>
          <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
            <Heading as={'h5'}>DID</Heading>
          </Box>
          <Box p={3}>
            <Field label="did" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="type" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'ethr-did-fs'}
              />
            </Field>
            <Field label="name" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'Jack'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
            <Field label="firstName" display={'flex'}>
              <Input
                spellCheck={false}
                width={'100%'}
                border={0}
                backgroundColor={'#313131'}
                boxShadow={0}
                type="text"
                required={true}
                value={'did:ethr:0x49a8246758f8d28e348318183d9498496074ca71'}
              />
            </Field>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Component
