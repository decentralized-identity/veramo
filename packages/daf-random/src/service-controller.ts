import { ServiceController, ServiceControllerOptions } from 'daf-core'
import faker from 'faker'

export class MessageService implements ServiceController {
  private options: ServiceControllerOptions

  constructor(options: ServiceControllerOptions) {
    this.options = options
  }

  instanceId() {
    return {
      did: this.options.issuer.did,
      sourceType: 'random',
    }
  }

  async sync(since: number) {
    setTimeout(() => {
      this.options.onRawMessage({
        raw: `From sync: ${faker.random.words(1)}`,
        meta: [
          {
            sourceType: this.instanceId().sourceType,
            sourceId: faker.random.uuid(),
            data: { subject: this.options.issuer.did },
          },
        ],
      })
    }, 1000)

    setTimeout(() => {
      this.options.onRawMessage({
        raw: `This should throw an error`,
      })
    }, 1000)

    // VC
    setTimeout(() => {
      this.options.onRawMessage({
        raw: `eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzA3MDU0OTMsInN1YiI6ImRpZDpldGhyOjB4NDY0OTcyNWQ5NjE4MGJhODQ0MTVjNDdmMTNlZDUxYWMxOTRhODQxNSIsIm5iZiI6MTU3MDcwNTQ5MywidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJjb21wYW55TmFtZSI6IkRyZWFtIEpvYiBMTEMuIiwic2FsYXJ5IjoiJDEwMCwwMDAiLCJkYXRlT2ZFbXBsb3ltZW50IjoiMjAxOSJ9fSwiaXNzIjoiZGlkOmV0aHI6MHgxM2EyMjcxZWY4ZTE4NTIwMGE1ZTlhYzI3YWE5ODZmZThmMDcwYjVkIn0.5KaBg5qhQWtDHhXWkXHGeCHs43F6zl_LnzVz8g_GsqjfG3Jtkuwrwf_bYIBC-G7ug8UIo_qFSsn5NWSte9iKsQE`,
      })
    }, 2000)

    // VP
    setTimeout(() => {
      this.options.onRawMessage({
        raw: `eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzA3MDU0OTEsInRhZyI6InBhcmVudDozZjE0YmNjNTRlNWRmZTMxYWRkMWYxZGVkZDFmMGFkYWE5ZDgxZjVkODgyZDFiMGQzNWQ0OWRmNWY3MTBhMDkzOWQzNmFhNjg0OTJjZTg5OWYyNmUxNjdmYzVlODljOTQyNGUyMGIwMDA3MWI4NDc4MWIxOGQ4YjhlMDIzZmNmMyIsInN1YiI6ImRpZDpldGhyOjB4MTNhMjI3MWVmOGUxODUyMDBhNWU5YWMyN2FhOTg2ZmU4ZjA3MGI1ZCIsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3N0VWlKOS5leUpwWVhRaU9qRTFOekEzTURVME9ERXNJbk4xWWlJNkltUnBaRHBsZEdoeU9qQjRORFkwT1RjeU5XUTVOakU0TUdKaE9EUTBNVFZqTkRkbU1UTmxaRFV4WVdNeE9UUmhPRFF4TlNJc0ltNWlaaUk2TVRVM01EY3dOVFE0TVN3aWRtTWlPbnNpUUdOdmJuUmxlSFFpT2xzaWFIUjBjSE02THk5M2QzY3Vkek11YjNKbkx6SXdNVGd2WTNKbFpHVnVkR2xoYkhNdmRqRWlYU3dpZEhsd1pTSTZXeUpXWlhKcFptbGhZbXhsUTNKbFpHVnVkR2xoYkNKZExDSmpjbVZrWlc1MGFXRnNVM1ZpYW1WamRDSTZleUpqYVhSNVNXUWlPaUpKUmxsRlVGTkpNU0o5ZlN3aWFYTnpJam9pWkdsa09tVjBhSEk2TUhobE5UQTFNR05rT1dNeFpUUXhZemd6TkRReE56WTNNbVF3WWpBeE9UUXdOekl5WXpVME1qZ3dJbjAudDlIQTdPa1ZPTHFsZmN0dVZRYTNrMXJYaDFVOXNfZkw0Tk5nSFJLVFd5dEJDdHFPRjcwSjBaUnJCa3BIUzAyb3dxYVoyZWRtU2NSamE1UjF6YXBNbmdBIiwiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3N0VWlKOS5leUpwWVhRaU9qRTFOekEzTURVME9EZ3NJbk4xWWlJNkltUnBaRHBsZEdoeU9qQjRORFkwT1RjeU5XUTVOakU0TUdKaE9EUTBNVFZqTkRkbU1UTmxaRFV4WVdNeE9UUmhPRFF4TlNJc0ltNWlaaUk2TVRVM01EY3dOVFE0T0N3aWRtTWlPbnNpUUdOdmJuUmxlSFFpT2xzaWFIUjBjSE02THk5M2QzY3Vkek11YjNKbkx6SXdNVGd2WTNKbFpHVnVkR2xoYkhNdmRqRWlYU3dpZEhsd1pTSTZXeUpXWlhKcFptbGhZbXhsUTNKbFpHVnVkR2xoYkNKZExDSmpjbVZrWlc1MGFXRnNVM1ZpYW1WamRDSTZleUp6WTJodmIyeE9ZVzFsSWpvaVZHaGxJRlZ1YVhabGNuTnBkSGtnYjJZZ1ZYQnZjblJzWVc1a2FXRWlMQ0p3Y205bmNtRnRUbUZ0WlNJNklrWnlaVzVqYUNCc2FXNW5kV2x6ZEdsamN5SXNJbWR5WVdSMVlYUnBiMjVaWldGeUlqb2lNakF4T1NJc0ltWnBibUZzUjNKaFpHVnpJam9pUWlzaWZYMHNJbWx6Y3lJNkltUnBaRHBsZEdoeU9qQjROMlZsWldObE9HUTVaakUxTURNME9UVmxOV1V5T1dKaFpHVTBOalkyTURNMk5EUmlOemxpWmlKOS5wUDB6YXlLcnJENmtCamJYN2N5N1F1SVEtcjloQ1ZTejlMc1J3dzRhMVI2bUdBSlZHX3pOYmJEeW05U29vQ0NRaUlPc2U3UUtKNmN6eloxNjdZTWwyQUEiXX0sImlzcyI6ImRpZDpldGhyOjB4NDY0OTcyNWQ5NjE4MGJhODQ0MTVjNDdmMTNlZDUxYWMxOTRhODQxNSJ9.IiZBHVbO6mBcS4FwDHKgFkR_sKe7kH7k8baBgcprAtJUnnFP2-9egBHvy4Mw_QguZxEeZXrhhB1JwqGPczqIcgA`,
      })
    }, 3000)

    // SDR
    setTimeout(() => {
      this.options.onRawMessage({
        raw: `eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzE3MzUwMTEsInN1YiI6ImRpZDpldGhyOjB4NDY0OTcyNWQ5NjE4MGJhODQ0MTVjNDdmMTNlZDUxYWMxOTRhODQxNSIsInR5cGUiOiJzZHIiLCJ2aXNpYmlsaXR5IjoiQk9USCIsImNsYWltcyI6eyJlbWFpbCI6eyJlc3NlbnRpYWwiOmZhbHNlLCJzdWIiOiJkaWQ6ZXRocjoweDQ2NDk3MjVkOTYxODBiYTg0NDE1YzQ3ZjEzZWQ1MWFjMTk0YTg0MTUiLCJpc3MiOlt7ImRpZCI6ImRpZDp3ZWI6dXBvcnQuY2xhaW1zIiwidXJsIjoiaHR0cHM6Ly91cG9ydC5jbGFpbXMvZW1haWwifSx7ImRpZCI6ImRpZDp3ZWI6c29ib2wuaW8iLCJ1cmwiOiJodHRwczovL3NvYm9sLmlvL3ZlcmlmeSJ9XSwicmVhc29uIjoiV2hlIG5lZWQgdG8gYmUgYWJsZSB0byBlbWFpbCB5b3UifSwibmF0aW9uYWxJZGVudGl0eSI6eyJlc3NlbnRpYWwiOnRydWUsInN1YiI6ImRpZDpldGhyOjB4NDY0OTcyNWQ5NjE4MGJhODQ0MTVjNDdmMTNlZDUxYWMxOTRhODQxNSIsImlzcyI6W3siZGlkIjoiZGlkOndlYjppZHZlcmlmaWVyLmNsYWltcyIsInVybCI6Imh0dHBzOi8vaWR2ZXJpZmllci5leGFtcGxlIn1dLCJyZWFzb24iOiJUbyBiZSBhYmxlIHRvIGxlZ2FsbHkgb3BlbiB5b3VyIGFjY291bnQifX0sImlzcyI6ImRpZDpldGhyOjB4OWZkZWU3MjI2OTBjYzVkY2RjOWZkNzA3NTEzMmM0OTQ0MjJjZjU0MiJ9.zebbbIznBqWbAEuHJME3mVHetohQXvbiFwGoWv-7xfo_bol-qHbrxKq7jZazKvHFy7HRy0QIqS2MjjOwkrq-_wA`,
      })
    }, 3500)
  }

  async init() {
    setInterval(() => {
      this.options.onRawMessage({
        raw: `From init: ${faker.random.words(4)}`,
        meta: [
          {
            sourceType: this.instanceId().sourceType,
            sourceId: faker.random.uuid(),
            data: { subject: this.options.issuer.did },
          },
        ],
      })
    }, 4000)

    return true
  }
}
