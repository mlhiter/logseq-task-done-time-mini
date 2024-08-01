import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'

export const settingSchema: Array<SettingSchemaDesc> = [
  {
    key: 'doneContent',
    type: 'string',
    default: '{content} - [[{date}]]',
    title: 'Done内容',
    description:
      '插入的内容，支持几个变量，如`{content}`表示未填充信息之前的块内容（仅在content模式可用），`{date}`指当前日期，`{time}`指当前时间',
  },
  {
    key: 'displayMode',
    type: 'enum',
    default: 'content',
    title: '展示模式',
    description:
      'content模式直接修改内容，property模式增加属性，childBlock模式添加一个子块',
    enumChoices: ['content', 'property', 'childBlock'],
    enumPicker: 'radio',
  },
  {
    key: 'collapseMode',
    type: 'boolean',
    default: true,
    title: '是否默认折叠子块',
    description: 'true默认折叠，false默认不折叠（只在childBlock模式生效）',
  },
]
