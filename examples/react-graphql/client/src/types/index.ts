export interface Identity {
  isManaged?: boolean
  did: string
  type?: string
  shortId: string
  firstName?: string
  lastName?: string
  url?: string
  description?: string
  profileImage?: string
}

export interface Field {
  type: string
  value: any
  isObj: boolean
}
