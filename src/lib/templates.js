/**
 * Built-in productivity templates with ready-to-use structure, icons, and blocks
 */
export const TEMPLATES = [
  {
    id: 'meeting_notes',
    title: 'Meeting Notes',
    icon: '🤝',
    description: 'Capture agenda, attendees, notes, and clear action items.',
    category: 'Work',
    blocks: [
      {
        id: 't_m_1',
        type: 'callout',
        content: 'Record key discussion points and assign actionable tasks before ending the meeting.',
        properties: { icon: '📌', color: 'blue' }
      },
      {
        id: 't_m_2',
        type: 'heading2',
        content: 'Participants & Details',
        properties: {}
      },
      {
        id: 't_m_3',
        type: 'bullet_list',
        content: 'Date & Time: Today, 2:00 PM',
        properties: {}
      },
      {
        id: 't_m_4',
        type: 'bullet_list',
        content: 'Attendees: Team leads, product managers, engineers',
        properties: {}
      },
      {
        id: 't_m_5',
        type: 'heading2',
        content: 'Meeting Agenda',
        properties: {}
      },
      {
        id: 't_m_6',
        type: 'numbered_list',
        content: 'Sprint retrospective and blockers review',
        properties: {}
      },
      {
        id: 't_m_7',
        type: 'numbered_list',
        content: 'Architecture review for upcoming feature',
        properties: {}
      },
      {
        id: 't_m_8',
        type: 'numbered_list',
        content: 'Timeline and deployment roadmap',
        properties: {}
      },
      {
        id: 't_m_9',
        type: 'divider',
        content: '',
        properties: {}
      },
      {
        id: 't_m_10',
        type: 'heading2',
        content: 'Action Items',
        properties: {}
      },
      {
        id: 't_m_11',
        type: 'todo',
        content: 'Review pull request and merge database schema updates',
        properties: { checked: false }
      },
      {
        id: 't_m_12',
        type: 'todo',
        content: 'Schedule follow-up sync with stakeholders',
        properties: { checked: false }
      }
    ]
  },
  {
    id: 'daily_journal',
    title: 'Daily Journal',
    icon: '☕',
    description: 'Reflect on your day, gratitude, and key achievements.',
    category: 'Personal',
    blocks: [
      {
        id: 't_j_1',
        type: 'quote',
        content: '"Focus on being productive instead of busy." — Tim Ferriss',
        properties: {}
      },
      {
        id: 't_j_2',
        type: 'heading2',
        content: 'Morning Gratitude 🙏',
        properties: {}
      },
      {
        id: 't_j_3',
        type: 'bullet_list',
        content: 'A fresh cup of hot coffee and quiet morning focus',
        properties: {}
      },
      {
        id: 't_j_4',
        type: 'bullet_list',
        content: 'Making steady progress on key projects',
        properties: {}
      },
      {
        id: 't_j_5',
        type: 'heading2',
        content: 'Top 3 Priorities for Today',
        properties: {}
      },
      {
        id: 't_j_6',
        type: 'todo',
        content: 'Deep work block: 9:00 AM - 12:00 PM',
        properties: { checked: false }
      },
      {
        id: 't_j_7',
        type: 'todo',
        content: 'Code review and unit test validation',
        properties: { checked: false }
      },
      {
        id: 't_j_8',
        type: 'todo',
        content: '30-minute afternoon walk and workout',
        properties: { checked: false }
      },
      {
        id: 't_j_9',
        type: 'divider',
        content: '',
        properties: {}
      },
      {
        id: 't_j_10',
        type: 'heading2',
        content: 'Evening Reflection & Wins',
        properties: {}
      },
      {
        id: 't_j_11',
        type: 'paragraph',
        content: 'What went well today? What could be improved tomorrow?',
        properties: {}
      }
    ]
  },
  {
    id: 'weekly_planning',
    title: 'Weekly Planning',
    icon: '🗓️',
    description: 'Map out weekly goals, schedule focus blocks, and review wins.',
    category: 'Planning',
    blocks: [
      {
        id: 't_w_1',
        type: 'callout',
        content: 'High-level plan for the upcoming week. Align your energy with your highest priorities.',
        properties: { icon: '🎯', color: 'purple' }
      },
      {
        id: 't_w_2',
        type: 'heading2',
        content: 'Main Objective for the Week',
        properties: {}
      },
      {
        id: 't_w_3',
        type: 'paragraph',
        content: 'Deliver feature release and ensure 100% test coverage.',
        properties: {}
      },
      {
        id: 't_w_4',
        type: 'heading3',
        content: 'Monday - Tuesday',
        properties: {}
      },
      {
        id: 't_w_5',
        type: 'todo',
        content: 'Finish UI components and interactions',
        properties: { checked: false }
      },
      {
        id: 't_w_6',
        type: 'heading3',
        content: 'Wednesday - Thursday',
        properties: {}
      },
      {
        id: 't_w_7',
        type: 'todo',
        content: 'API endpoints integration and edge-case testing',
        properties: { checked: false }
      },
      {
        id: 't_w_8',
        type: 'heading3',
        content: 'Friday Wrap-up',
        properties: {}
      },
      {
        id: 't_w_9',
        type: 'todo',
        content: 'Weekly retrospective and planning next cycle',
        properties: { checked: false }
      }
    ]
  },
  {
    id: 'study_notes',
    title: 'Study Notes',
    icon: '📚',
    description: 'Organize coursework, key definitions, lecture summaries, and questions.',
    category: 'Learning',
    blocks: [
      {
        id: 't_s_1',
        type: 'heading1',
        content: 'Topic Overview',
        properties: {}
      },
      {
        id: 't_s_2',
        type: 'paragraph',
        content: 'Enter the subject name and lecture chapter title here.',
        properties: {}
      },
      {
        id: 't_s_3',
        type: 'heading2',
        content: 'Core Concepts & Definitions',
        properties: {}
      },
      {
        id: 't_s_4',
        type: 'bullet_list',
        content: 'Concept 1: Definition and key properties',
        properties: {}
      },
      {
        id: 't_s_5',
        type: 'bullet_list',
        content: 'Concept 2: Practical applications and examples',
        properties: {}
      },
      {
        id: 't_s_6',
        type: 'heading2',
        content: 'Code / Technical Syntax',
        properties: {}
      },
      {
        id: 't_s_7',
        type: 'code',
        content: '// Example implementation\nfunction solve(input) {\n  return input.map(x => x * 2);\n}',
        properties: { language: 'javascript' }
      },
      {
        id: 't_s_8',
        type: 'heading2',
        content: 'Questions for Review',
        properties: {}
      },
      {
        id: 't_s_9',
        type: 'todo',
        content: 'Solve practice problems 1 through 10',
        properties: { checked: false }
      }
    ]
  },
  {
    id: 'task_list',
    title: 'Simple Task List',
    icon: '✅',
    description: 'Clean checklist organized by priority and urgency.',
    category: 'Personal',
    blocks: [
      {
        id: 't_t_1',
        type: 'heading2',
        content: '🔥 Urgent & Important',
        properties: {}
      },
      {
        id: 't_t_2',
        type: 'todo',
        content: 'High priority task to complete first',
        properties: { checked: false }
      },
      {
        id: 't_t_3',
        type: 'heading2',
        content: '⚡ Quick Wins (< 15 mins)',
        properties: {}
      },
      {
        id: 't_t_4',
        type: 'todo',
        content: 'Reply to pending emails',
        properties: { checked: false }
      },
      {
        id: 't_t_5',
        type: 'todo',
        content: 'Organize desktop and download folder',
        properties: { checked: false }
      },
      {
        id: 't_t_6',
        type: 'heading2',
        content: '🌱 Later this month',
        properties: {}
      },
      {
        id: 't_t_7',
        type: 'todo',
        content: 'Research new books and learning materials',
        properties: { checked: false }
      }
    ]
  }
];
