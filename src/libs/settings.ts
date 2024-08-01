import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'

export const settingSchema: Array<SettingSchemaDesc> = [
  {
    key: 'doneContent',
    type: 'string',
    default: '{content} - [[{date}]]',
    title: 'Done内容',
    description:
      '插入的内容，支持几个变量，如`{date}`指当前日期，`{time}`指当前时间',
  },
  {
    key: 'displayPosition',
    type: 'enum',
    default: 'right',
    title: '展示位置',
    description:
      'left表示展示在原来内容的左边，right表示展示在原来内容的右边（该配置只在content模式生效）',
    enumChoices: ['left', 'right'],
    enumPicker: 'radio',
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
