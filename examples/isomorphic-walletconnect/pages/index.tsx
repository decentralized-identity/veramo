import { Text } from 'rimble-ui'

const Welcome = props => {
  return <Text>{'loading'}</Text>
}

export default Welcome

export async function getServerSideProps(context) {
  return {
    props: {
      data: '',
    },
  }
}
