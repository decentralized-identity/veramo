import fetch from 'isomorphic-unfetch'

export default async function(...args) {
  // @ts-ignore
  const res = await fetch(...args)
  return res.json()
}
