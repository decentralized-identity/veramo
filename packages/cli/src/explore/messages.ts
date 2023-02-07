import blessed, { Widgets } from 'blessed'
import { IMessage } from '@veramo/core-types'
import { shortDate, shortDid } from './utils.js'
import { ConfiguredAgent } from '../setup.js'
import { styles } from './styles.js'

export const getMessagesTable = async (agent: ConfiguredAgent, screen: Widgets.Screen) => {
  screen.title = 'Messages'

  const messageTable = blessed.listtable({
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

  const messages = await agent.dataStoreORMGetMessages()
  messageTable.setData(
    [['Created', 'Type', 'From', 'To']].concat(
      messages.map((m) => [shortDate(m.createdAt), m.type, shortDid(m.from), shortDid(m.to)]),
    ),
  )

  messageTable.on('select', async function (data) {
    const i = messageTable.getItemIndex(data)
    showMessage(messages[i - 1])
  })

  function showMessage(message: IMessage) {
    const messageBox = blessed.box({
      label: 'Message',
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

      content: JSON.stringify(message, null, 2),
    })
    messageBox.key(['escape'], function (ch, key) {
      messageBox.destroy()
      screen.render()
    })

    messageBox.focus()
    screen.append(messageBox)
    screen.render()
  }

  return messageTable
}
