export default {
  components: {
    schemas: {
      ValidationError: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Error name',
          },
          method: {
            type: 'string',
            description: 'Method',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          path: {
            type: 'string',
            description: 'Error path',
          },
          code: {
            type: 'string',
            description: 'Error code',
          },
          description: {
            type: 'string',
            description: 'Error description',
          },
        },
        required: ['didUrl'],
        description: 'Agent method arguments validation error',
      },
    },
  },
}
