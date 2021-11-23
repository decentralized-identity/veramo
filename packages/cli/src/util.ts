export async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf-8')

    process.stdin.on('readable', () => {
      let chunk: string
      while ((chunk = process.stdin.read())) {
        data += chunk
      }
    })

    process.stdin.on('end', () => {
      // There will be a trailing \n from the user hitting enter. Get rid of it.
      data = data.replace(/\n$/, '')
      resolve(data)
    })

    process.stdin.on('error', (error) => {
      reject(error)
    })
  })
}
