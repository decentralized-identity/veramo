import { readdir, createReadStream, writeFile } from 'fs-extra'
import { createInterface } from 'readline'
import { join, parse } from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'

const DOCS_DIR = './docs/api'

async function main() {
  await fs.promises.mkdir(DOCS_DIR, { recursive: true })

  await new Promise((resolve, reject) =>
    exec(`api-documenter markdown -i ./temp -o ${DOCS_DIR}`, (err, stdout, stderr) => {
      console.log(stdout)
      console.error(stderr)
      if (err) {
        reject(err)
      } else {
        resolve('')
      }
    }),
  )

  const docFiles = await readdir(DOCS_DIR)
  for (const docFile of docFiles) {
    try {
      const { name: id, ext } = parse(docFile)
      if (ext !== '.md') {
        continue
      }

      const docPath = join(DOCS_DIR, docFile)
      const input = createReadStream(docPath)
      const output: string[] = []
      const lines = createInterface({
        input,
        crlfDelay: Infinity,
      })

      let title = ''
      lines.on('line', (line) => {
        let skip = false
        if (!title) {
          const titleLine = line.match(/## (.*)/)
          if (titleLine) {
            title = titleLine[1]
          }
        }
        const indexHomeLink = line.match(/\[Home]\(.\/index\.md\)/)
        const homeLink = line.match(/\[Home]\(.\/index\.md\) &gt; (.*)/)
        if (homeLink) {
          line = line.replace('Home', 'Packages')
        }

        if (indexHomeLink) {
          // Skip the breadcrumb for the toplevel index file.
          if (id === 'index') {
            skip = true
          }

          skip = true
        }

        // See issue #4. api-documenter expects \| to escape table
        // column delimiters, but docusaurus uses a markdown processor
        // that doesn't support this. Replace with an escape sequence
        // that renders |.
        if (line.startsWith('|')) {
          line = line.replace(/\\\|/g, '&#124;')
        }

        // MDX cries when you put commects in there :(
        line = replaceAll(line, '<!-- -->', '')

        if (id === 'core') {
          line = line.replace('core package', 'Veramo Core')
        }

        if (!skip) {
          output.push(line)
        }
      })

      await new Promise((resolve) => lines.once('close', resolve))
      input.close()

      const header = ['---', `id: ${id}`, `title: ${title}`, `hide_title: true`, '---']
      let outputString = header.concat(output).join('\n')

      outputString = outputString.replace(/<a\nhref=/g, '<a href=')

      await writeFile(docPath, outputString)
    } catch (err) {
      console.error(`Could not process ${docFile}: ${err}`)
    }
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace)
}

main()
