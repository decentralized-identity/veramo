import blessed, { Widgets } from 'blessed'
import { UniqueVerifiableCredential } from '@veramo/core-types'
import { shortDate, shortDid, copyToClipboard } from './utils.js'
import { ConfiguredAgent } from '../setup.js'
import { styles } from './styles.js'
import { asArray, extractIssuer } from '@veramo/utils'

export const getCredentialsTable = async (agent: ConfiguredAgent, screen: Widgets.Screen) => {
  screen.title = 'Credentials'

  const credentialsTable = blessed.listtable({
    top: '0',
    left: '0',
    border: 'line',
    align: 'left',
    tags: true,
    keys: true,
    width: '100%',
    height: '100%',
    mouse: true,
    style: styles.listtable,
  })

  const credentials = await agent.dataStoreORMGetVerifiableCredentials()
  credentialsTable.setData(
    [['Created', 'Type', 'From', 'To']].concat(
      credentials.map(({ verifiableCredential: m }) => [
        shortDate(m.issuanceDate),
        asArray(m.type || []).join(','),
        shortDid(extractIssuer(m)),
        shortDid(m.credentialSubject.id),
      ]),
    ),
  )

  credentialsTable.on('select', async function (data) {
    const i = credentialsTable.getItemIndex(data)
    showCredential(credentials[i - 1])
  })

  function showCredential(credential: UniqueVerifiableCredential) {
    const credentialBox = blessed.box({
      label: 'Credential',
      top: 'center',
      left: 'center',
      height: '90%',
      width: '90%',
      border: 'line',
      shadow: true,
      mouse: true,
      keys: true,
      scrollable: true,
      vi: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'grey',
        },
        style: {
          inverse: false,
        },
      },

      content: JSON.stringify(credential, null, 2),
    })
    credentialBox.key(['c'], function (ch, key) {
      var messageBox = blessed.message({
        parent: screen,
        top: 'center',
        left: 'center',
        height: 'shrink',
        width: 'shrink',
        border: 'line',
        shadow: true,
        style: {
          fg: 'green'
        },
      })
      const success = copyToClipboard(JSON.stringify(credential, null, 2))
      const message = success ? 'Copied to clipboard.' : 'Could not copy to clipboard.'
      messageBox.display(message, () => {})
    })
    credentialBox.key(['escape'], function (ch, key) {
      credentialBox.destroy()
      screen.render()
    })

    credentialBox.focus()
    screen.append(credentialBox)
    screen.render()
  }

  return credentialsTable
}
