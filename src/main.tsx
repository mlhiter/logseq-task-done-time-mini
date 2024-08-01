import '@logseq/libs'

import React from 'react'
import { format } from 'date-fns'
import * as ReactDOM from 'react-dom/client'

import App from './App'

import './index.css'
import { logseq as pluginInfo } from '../package.json'

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args)

const pluginId = pluginInfo.id

// main function
async function main() {
  console.info(`#${pluginId}: MAIN`)
  const root = ReactDOM.createRoot(document.getElementById('app')!)

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )

  function createModel() {
    return {
      show() {
        logseq.showMainUI()
      },
    }
  }

  logseq.provideModel(createModel())
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  })

  const openIconName = 'TaskDoneTime-Mini'

  logseq.provideStyle(css`
    .${openIconName} {
      opacity: 0.55;
      font-size: 20px;
      margin-top: 4px;
    }

    .${openIconName}:hover {
      opacity: 0.9;
    }
  `)

  logseq.App.registerUIItem('toolbar', {
    key: openIconName,
    template: `
      <div data-on-click="show" class="${openIconName}">⚙️</div>
    `,
  })

  const { preferredDateFormat } = await logseq.App.getUserConfigs()

  // 监控数据变化
  logseq.DB.onChanged(async (data) => {
    if (data.txMeta?.outlinerOp !== 'save-block') return
    if (data.txMeta?.undo || data.txMeta?.redo) return

    console.log('data changed', data)

    const block = await logseq.Editor.getBlock(data.blocks[0].uuid)
    const currentBlockContent = block?.content
    console.log('current block', block)
    const isDoneStatus = block?.marker === 'DONE'

    if (!block || !isDoneStatus || !currentBlockContent) return

    const date = new Date()
    const formattedUserDate = format(date, preferredDateFormat)

    const addedContent = `- [[${formattedUserDate}]]`

    // 检查是否已经加入过内容
    const datePattern = /\d{4}-\d{2}-\d{2}/
    const combinedPattern = new RegExp(`- \\[\\[${datePattern.source}\\]\\]`)

    // 已经加入过内容，而且状态为DONE，则不操作
    // 已经加入过内容，但是状态变为其他状态，删除添加的内容
    if (combinedPattern.test(currentBlockContent)) {
      if (isDoneStatus) return
      const newContent = currentBlockContent.replace(combinedPattern, '').trim()
      await logseq.Editor.updateBlock(block.uuid, newContent)
      return
    }

    const newContent = ` ${currentBlockContent} ${addedContent}`
    await logseq.Editor.updateBlock(block.uuid, newContent)
  })
}

logseq.ready(main).catch(console.error)
