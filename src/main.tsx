import '@logseq/libs'

import { format } from 'date-fns'

import './index.css'
import { getDatePattern } from './libs/date'
import { settingSchema } from './libs/settings'
import { logseq as pluginInfo } from '../package.json'
import { BlockEntity, BlockIdentity } from '@logseq/libs/dist/LSPlugin'
import { englishSettingSchema } from './libs/settings_en'

const pluginId = pluginInfo.id

interface Settings {
  doneContent: string
  displayMode: 'content' | 'property' | 'childBlock'
  displayPosition: 'left' | 'right'
  collapseMode: boolean
  disabled: boolean
  isJournalPageAdd: boolean
}

// main function
async function main() {
  console.info(`#${pluginId}: MAIN`)

  // 初始化设置（当安装插件之后第一次注入）
  if (logseq.settings === undefined) {
    logseq.updateSettings({
      doneContent: '- [[{date}]]',
      displayPosition: 'right',
      displayMode: 'content',
      collapseMode: true,
      isJournalPageAdd: false,
    })
  }

  const { preferredLanguage } = await logseq.App.getUserConfigs()
  if (preferredLanguage === 'zh-CN') {
    logseq.useSettingsSchema(settingSchema)
  } else {
    logseq.useSettingsSchema(englishSettingSchema)
  }

  // 监控数据变化
  logseq.DB.onChanged(async (data) => {
    // 只监测数据修改，且不是撤销和重做操作
    if (data.txMeta?.outlinerOp !== 'save-block') return
    if (data.txMeta?.undo || data.txMeta?.redo) return

    const {
      doneContent,
      displayMode,
      displayPosition,
      collapseMode,
      isJournalPageAdd,
    } = logseq.settings as unknown as Settings

    // 用户如果更改了日期格式，需要重新获取（放在main函数顶层获取不到最新,所以放这里）
    const { preferredDateFormat } = await logseq.App.getUserConfigs()

    const block = await logseq.Editor.getBlock(data.blocks[0].uuid)
    const isDoneStatus = block?.marker === 'DONE'
    const pageId = block?.page.id as number
    const currentPage = await logseq.Editor.getPage(pageId, {
      includeChildren: false,
    })

    if (
      currentPage?.name.replace(
        /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
        (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
      ) === format(new Date(), preferredDateFormat) &&
      !isJournalPageAdd
    ) {
      return
    }

    if (!block || !block.content || !block.marker) return

    switch (displayMode) {
      case 'content':
        await updateContent(
          block,
          isDoneStatus,
          doneContent,
          displayPosition,
          preferredDateFormat
        )
        break
      case 'property':
        await updateProperty(
          block,
          isDoneStatus,
          doneContent,
          preferredDateFormat
        )
        break
      case 'childBlock':
        await updateChildBlock(
          block,
          isDoneStatus,
          doneContent,
          collapseMode,
          preferredDateFormat
        )
        break
    }
  })
  async function updateContent(
    block: BlockEntity,
    isDoneStatus: boolean,
    doneContent: string,
    displayPosition: string,
    preferredDateFormat: string
  ) {
    const datePattern = getDatePattern(preferredDateFormat)
    const timePattern = '\\d{2}:\\d{2}(:\\d{2})?'
    // 转义 doneContent 中的特殊字符
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    // 替换 doneContent 中的占位符，并保留转义后的特殊字符
    const combinedPattern = escapeRegExp(doneContent)
      .replace(/\\\{date\\\}/g, datePattern)
      .replace(/\\\{time\\\}/g, timePattern)
    const regex = new RegExp(combinedPattern)

    // 1. 已经加入过内容，而且状态为DONE，则不操作
    if (regex.test(block.content) && isDoneStatus) return

    // 2. 已经加入过内容，但是状态变为其他状态，删除添加的内容
    if (regex.test(block.content)) {
      const newContent = block.content.replace(regex, '').trim()
      await logseq.Editor.updateBlock(block.uuid, newContent)
      return
    }

    // 3. 没有加入过内容，而且状态不为DONE则不操作
    if (!isDoneStatus) return

    // 4. 没有加入过内容，而且状态为DONE则加入内容
    // 首先检测doneContent是否包含{date}，{time}等变量并分别替换为真实值
    // 并且注意处理block.content开头的DONE字符串（这个字符串必须在开头，即便我们将displayPosition设置为left）
    const contentWithoutDone = block.content.replace(/^DONE\s*/, '')
    const tempContentForReplace = doneContent
      .replace(/\{date\}/g, format(new Date(), preferredDateFormat))
      .replace(/\{time\}/g, format(new Date(), 'HH:mm'))
    const finalContentForReplace =
      displayPosition === 'right'
        ? `DONE ${contentWithoutDone} ${tempContentForReplace}`
        : `DONE ${tempContentForReplace} ${contentWithoutDone}`

    await logseq.Editor.updateBlock(block.uuid, finalContentForReplace)
  }
  async function updateProperty(
    block: BlockEntity,
    isDoneStatus: boolean,
    doneContent: string,
    preferredDateFormat: string
  ) {
    // 从doneContent中提取出属性值
    const propertyRegex = /^([a-z]+)::\s+(.+)/
    const match = doneContent.match(propertyRegex)
    if (!match) {
      await logseq.UI.showMsg('请在设置中设置正确的属性格式.', 'error')
      return
    }
    const propertyName = match[1]
    const propertyValue = match[2]
    const hasProperty = Object.prototype.hasOwnProperty.call(
      block.properties,
      propertyName
    )

    // 1. 已经添加过相应属性，而且状态为DONE，则不操作
    if (hasProperty && isDoneStatus) return

    // 2. 已经添加过相应属性，但是状态变为其他状态，删除添加的属性
    if (hasProperty) {
      await logseq.Editor.removeBlockProperty(block.uuid, propertyName)
      return
    }

    // 3. 没有添加过相应属性，而且状态不为DONE则不操作
    if (!isDoneStatus) return

    // 4. 没有添加过相应属性，而且状态为DONE则添加属性
    const finalPropertyValue = propertyValue
      .replace(/\{date\}/g, format(new Date(), preferredDateFormat))
      .replace(/\{time\}/g, format(new Date(), 'HH:mm'))

    await logseq.Editor.upsertBlockProperty(
      block.uuid,
      propertyName,
      finalPropertyValue
    )
  }
  async function updateChildBlock(
    block: BlockEntity,
    isDoneStatus: boolean,
    doneContent: string,
    collapseMode: boolean,
    preferredDateFormat: string
  ) {
    const datePattern = getDatePattern(preferredDateFormat)
    const timePattern = '\\d{2}:\\d{2}(:\\d{2})?'
    // 转义 doneContent 中的特殊字符
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    // 替换 doneContent 中的占位符，并保留转义后的特殊字符
    // 特殊情况：插入的子块的开头的空白字符会被忽略，所以需要把这里的空白字符也忽略
    const combinedPattern = escapeRegExp(doneContent)
      .replace(/\\\{date\\\}/g, datePattern)
      .replace(/\\\{time\\\}/g, timePattern)
      .trim()
    const regex = new RegExp(combinedPattern)
    // 特殊情况：这里要提前判断是否有子块，否则firstChild拿不到会报错
    if (block.children?.length === 0 && isDoneStatus) {
      const contentForChild = doneContent
        .replace(/\{date\}/g, format(new Date(), preferredDateFormat))
        .replace(/\{time\}/g, format(new Date(), 'HH:mm'))

      await logseq.Editor.insertBlock(block.uuid, contentForChild)
      if (collapseMode) {
        await logseq.Editor.setBlockCollapsed(block.uuid, true)
      }
      return
    }
    if (block.children?.length === 0 && !isDoneStatus) return

    const firstChildUUid = block.children?.[0]?.[1] as BlockIdentity
    const firstChild = await logseq.Editor.getBlock(firstChildUUid)
    const hasDoneContent = regex.test(firstChild!.content)

    // 1. 没有加入过相应子块，而且状态不为DONE，则不操作
    if (!isDoneStatus && !hasDoneContent) return

    // 2. 已经加入过相应子块，而且状态为DONE，则不操作
    if (hasDoneContent && isDoneStatus) return

    // 3. 已经加入过相应子块，但是状态变为其他状态，删除添加的子块
    if (hasDoneContent) {
      await logseq.Editor.removeBlock(firstChildUUid)
      return
    }
    // 4. 没有加入过相应子块，而且状态为DONE则加入子块
    // 首先检测doneContent是否包含{date}，{time}等变量并分别替换为真实值
    if (!hasDoneContent && isDoneStatus) {
      const contentForChild = doneContent
        .replace(/\{date\}/g, format(new Date(), preferredDateFormat))
        .replace(/\{time\}/g, format(new Date(), 'HH:mm'))

      await logseq.Editor.insertBlock(block.uuid, contentForChild)
      if (collapseMode) {
        await logseq.Editor.setBlockCollapsed(block.uuid, true)
      }
    }
  }
}

logseq.ready(main).catch(console.error)
