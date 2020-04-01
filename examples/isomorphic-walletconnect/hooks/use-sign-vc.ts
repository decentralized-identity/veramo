import { mutate } from 'swr'
import fetch from '../libs/fetch'

async function useSignVC(subject: string) {
  return mutate(
    '/api/sign-vc',
    await fetch('/api/sign-vc', {
      method: 'POST',
      body: JSON.stringify({ subject }),
    }),
  )
}

export default useSignVC
