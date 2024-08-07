import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'

export const englishSettingSchema: Array<SettingSchemaDesc> = [
  {
    key: 'doneContent',
    type: 'string',
    default: '{content} - [[{date}]]',
    title: 'Done Information',
    description:
      'Insert information that supports several variables, such as `{date}` for the current date and `{time}` for the current time.\n Note: Do not use strings with `-` or uppercase letters for property schema property names.',
  },
  {
    key: 'displayPosition',
    type: 'enum',
    default: 'right',
    title: 'Display Position',
    description:
      'Left indicates that it is displayed to the left of the original content, and right indicates that it is displayed to the right of the original content (this configuration only takes effect in Content Mode)',
    enumChoices: ['left', 'right'],
    enumPicker: 'radio',
  },
  {
    key: 'displayMode',
    type: 'enum',
    default: 'content',
    title: 'Display Mode',
    description:
      'Content Mode: directly modify content; Property Mode: add attributes; ChildBlock Mode: insert a child block',
    enumChoices: ['content', 'property', 'childBlock'],
    enumPicker: 'radio',
  },
  {
    key: 'collapseMode',
    type: 'boolean',
    default: true,
    title: 'Collapse Mode',
    description:
      'true collapses by default,false does not collapse by default (only effective in childBlock mode)',
  },
  {
    key: 'isJournalPageAdd',
    type: 'boolean',
    default: false,
    title:
      'Whether to add the done information on the journal page if the task is completed on this journal day',
    description:
      'true: the Done information is added when the task is completed on the current day; false: the done information is not added',
  },
]
