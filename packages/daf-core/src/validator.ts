const ZSchema = require('z-schema')

const validator = new ZSchema({})
validator.setRemoteReference('http://json-schema.org/draft-07/schema#', {
  type: ['array', 'boolean', 'integer', 'number', 'object', 'string']
})

export class ValidationError extends Error{
  public code: string
  public message: string
  public path: string
  public description: string
  constructor(message: string, code: string, path: string, description: string) {
    super(message)
    this.name = 'ValidationError'
    this.message = message
    this.description = description
    this.path = path
    this.code = code
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}


export const validate = (args: object, schema: object, schemaPath?: string) => {
  const options = schemaPath ? { schemaPath } : {}
  const valid = validator.validate(args, schema, options)
  if (!valid) {
    const errors = validator.getLastErrors()
    throw new ValidationError(errors[0].message, errors[0].code, errors[0].path, errors[0].description)
  }
}