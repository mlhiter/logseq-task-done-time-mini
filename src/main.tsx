import '@logseq/libs'

import React from 'react'
import { format } from 'date-fns'
import * as ReactDOM from 'react-dom/client'

import './index.css'
import App from './App'
import { getDatePattern } from './libs/date'
import { settingSchema } from './libs/settings'
import { logseq as pluginInfo } from '../package.json'

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args)

const pluginId = pluginInfo.id

interface Settings {
  doneContent: string
  displayMode: 'content' | 'property' | 'childBlock'
  collapseMode: boolean
  disabled: boolean
}

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

  // 初始化设置（当安装插件之后第一次注入）
  if (logseq.settings === undefined) {
    logseq.updateSettings({
      doneContent: '{content} - [[{date}]]',
      displayMode: 'content',
      collapseMode: true,
    })
  }

  const { doneContent, displayMode, collapseMode } =
    logseq.settings as unknown as Settings

  console.log(doneContent, displayMode, collapseMode)

  logseq.useSettingsSchema(settingSchema)

  // 监控数据变化
  logseq.DB.onChanged(async (data) => {
    // 只监测数据修改，且不是撤销和重做操作
    if (data.txMeta?.outlinerOp !== 'save-block') return
    if (data.txMeta?.undo || data.txMeta?.redo) return

    const block = await logseq.Editor.getBlock(data.blocks[0].uuid)
    const isDoneStatus = block?.marker === 'DONE'

    if (!block || !block.content) return

    const datePattern = getDatePattern(preferredDateFormat)
    const combinedPattern = new RegExp(`- \\[\\[${datePattern.source}\\]\\]`)

    // 1. 已经加入过内容，而且状态为DONE，则不操作
    if (combinedPattern.test(block.content) && isDoneStatus) {
      return
    }

    // 2. 已经加入过内容，但是状态变为其他状态，删除添加的内容
    if (combinedPattern.test(block.content)) {
      const newContent = block.content.replace(combinedPattern, '').trim()
      await logseq.Editor.updateBlock(block.uuid, newContent)
      return
    }

    // 3. 没有加入过内容，而且状态不为DONE则不操作
    if (!isDoneStatus) return

    // 4. 没有加入过内容，而且状态为DONE则加入内容
    // 首先检测doneContent是否包含{date}，{content}，{time}等变量并分别替换为真实值
    // 并且注意处理block.content开头的DONE字符串
    const contentWithoutDone = block.content.replace(/^DONE\s*/, '')
    const tempContentForReplace = doneContent
      .replace(/\{date\}/g, format(new Date(), preferredDateFormat))
      .replace(/\{content\}/g, contentWithoutDone)
      .replace(/\{time\}/g, format(new Date(), 'HH:mm'))
    const finalContentForReplace = `DONE ${tempContentForReplace}`

    if (isDoneStatus) {
      const newContent = finalContentForReplace
      await logseq.Editor.updateBlock(block.uuid, newContent)
    }
  })
}

logseq.ready(main).catch(console.error)
