import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'

export const settingSchema: Array<SettingSchemaDesc> = [
  {
    key: 'doneContent',
    type: 'string',
    default: '{content} - [[{date}]]',
    title: 'Done信息',
    description:
      '插入的信息，支持几个变量，如`{date}`指当前日期，`{time}`指当前时间;\n请注意：属性模式属性名不要使用带有`-`或者大写字母的字符串',
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
  {
    key: 'isJournalPageAdd',
    type: 'boolean',
    default: false,
    title: '日志界面当日任务当日完成是否添加Done信息',
    description: 'true表示当日任务当日完成时添加Done信息，false表示不添加',
  },
]
