import { Types } from 'mongoose';
import type { LeadStatus } from '../models/lead.model.js';

interface SeedDefinition {
  name: string;
  company: string;
  phone: string | null;
  status: LeadStatus;
  daysAgo: number;
  notes: [string, string];
  followUp: 'today' | 'overdue' | 'future' | 'none';
}

const definitions: SeedDefinition[] = [
  {
    name: 'Sarah Connor',
    company: 'Acme Corp',
    phone: '555-0199',
    status: 'proposal_sent',
    daysAgo: 2,
    notes: [
      'Initial discovery call. They need a CRM for 50 reps.',
      'Sent pricing tier PDF. Said she would review with her boss.',
    ],
    followUp: 'today',
  },
  {
    name: 'Hank Scorpio',
    company: 'Globex',
    phone: null,
    status: 'new',
    daysAgo: 0,
    notes: [
      'Reviewed the contact form.',
      'Inbound lead from website contact form.',
    ],
    followUp: 'none',
  },
  {
    name: 'Bill Lumbergh',
    company: 'Initech',
    phone: '555-0110',
    status: 'contacted',
    daysAgo: 7,
    notes: [
      'Called to introduce LeadFlow.',
      'Left a voicemail with his assistant.',
    ],
    followUp: 'overdue',
  },
  {
    name: 'Bruce Wayne',
    company: 'Wayne Ent',
    phone: null,
    status: 'won',
    daysAgo: 21,
    notes: [
      'Reviewed final contract terms.',
      'Contract signed! Sending welcome package.',
    ],
    followUp: 'none',
  },
  {
    name: 'Diana Prince',
    company: 'Themyscira Labs',
    phone: '555-0140',
    status: 'qualified',
    daysAgo: 1,
    notes: [
      'Discovery call confirmed budget and timeline.',
      'Scheduled a product demonstration.',
    ],
    followUp: 'future',
  },
  {
    name: 'Peter Parker',
    company: 'Daily Bugle',
    phone: '555-0150',
    status: 'lost',
    daysAgo: 10,
    notes: [
      'Discussed the reporting workflow.',
      'Selected another vendor due to budget.',
    ],
    followUp: 'none',
  },
];

export function buildSeedData(now: Date) {
  return definitions.map((definition, index) => {
    const latestAt = new Date(now);
    latestAt.setDate(latestAt.getDate() - definition.daysAgo);
    latestAt.setHours(latestAt.getHours() - 2);
    const firstAt = new Date(latestAt.getTime() - 3 * 86400000);
    const createdAt = new Date(firstAt.getTime() - 86400000);
    let followUpAt: Date | null = null;
    if (definition.followUp !== 'none') {
      followUpAt = new Date(now);
      followUpAt.setDate(
        followUpAt.getDate() +
          (definition.followUp === 'overdue'
            ? -1
            : definition.followUp === 'future'
              ? 2
              : 0),
      );
      followUpAt.setHours(14, 0, 0, 0);
    }
    const leadId = new Types.ObjectId(
      `6c656164666c6f77${(index + 1).toString(16).padStart(8, '0')}`,
    );
    return {
      lead: {
        _id: leadId,
        name: definition.name,
        company: definition.company,
        phone: definition.phone,
        status: definition.status,
        followUpAt,
        lastNote: definition.notes[1],
        lastDiscussionAt: latestAt,
        createdAt,
        updatedAt: latestAt,
      },
      discussions: [
        {
          leadId,
          content: 'Lead created',
          kind: 'system' as const,
          followUpAt: null,
          createdAt,
        },
        {
          leadId,
          content: definition.notes[0],
          kind: 'note' as const,
          followUpAt: null,
          createdAt: firstAt,
        },
        {
          leadId,
          content: definition.notes[1],
          kind: 'note' as const,
          followUpAt,
          createdAt: latestAt,
        },
      ],
    };
  });
}
