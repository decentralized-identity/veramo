import { Box, Button, Heading, Text } from 'rimble-ui'

const ContentBlock = props => {
  return (
    <Box
      boxShadow={`0 0 20px rgba(0,0,0,0.1)`}
      width={300}
      height={250}
      mr={5}
      p={3}
      borderRadius={5}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
    >
      <Box>
        <Heading as={'h4'}>{props.title}</Heading>
        <Text as={'p'}>{props.text}</Text>
      </Box>
      <Box>
        <Button width={'100%'} onClick={props.action}>
          {props.buttonText}
        </Button>
      </Box>
    </Box>
  )
}

export default ContentBlock
