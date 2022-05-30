import blessed, { Widgets } from 'blessed'
import { UniqueVerifiablePresentation } from '@veramo/core'
import { shortDate, shortDid } from './utils'
import { ConfiguredAgent } from '../setup'
import { styles } from './styles'
import { asArray } from '@veramo/utils'

export const getPresentationsTable = async (agent: ConfiguredAgent, screen: Widgets.Screen) => {
  screen.title = 'Presentations'

  const presentationsTable = blessed.listtable({
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

  const presentations = await agent.dataStoreORMGetVerifiablePresentations({})
  presentationsTable.setData(
    [['Created', 'Type', 'Holder', 'Verifier']].concat(
      presentations.map(({ verifiablePresentation: m }) => [
        shortDate(m.issuanceDate),
        asArray(m.type || []).join(','),
        shortDid(m.holder),
        shortDid(asArray(m.verifier || []).join(',')),
      ]),
    ),
  )

  presentationsTable.on('select', async function (data) {
    const i = presentationsTable.getItemIndex(data)
    showPresentation(presentations[i - 1])
  })

  function showPresentation(presentation: UniqueVerifiablePresentation) {
    const presentationBox = blessed.box({
      label: 'Presentation',
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

      content: JSON.stringify(presentation, null, 2),
    })
    presentationBox.key(['escape'], function (ch, key) {
      presentationBox.destroy()
      screen.render()
    })

    presentationBox.focus()
    screen.append(presentationBox)
    screen.render()
  }

  return presentationsTable
}
