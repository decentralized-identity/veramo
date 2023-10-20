/**
 * Represents recipient did
 * @public
 */
export interface IRecipientDid {
  /**
   * required: did
   */
  did: string

  /**
   * required: mediation status
   */
  recipient_did: string
}

/**
 * Represents a did or null if not found
 * @public
 */
export type RemoveRecipientDidResult = string | null

/**
 * Represents a list recipient dids
 * @public
 */
export type RecipientDids = IRecipientDid[]
