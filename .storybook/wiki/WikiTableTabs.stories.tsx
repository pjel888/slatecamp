import type { Meta, StoryObj } from '@storybook/react';
import { WikiTableTabs } from '@/components/wiki/blocks/WikiTableTabs';

const meta: Meta<typeof WikiTableTabs> = {
  title: 'Wiki/Blocks/WikiTableTabs',
  component: WikiTableTabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiTableTabs>;

const regulationTables = [
  {
    id: 'bp344',
    title: 'BP 344',
    content: `| Feature | Requirement | Penalty |
|---------|-------------|---------|
| Ramps | Slope ≤ 1:12 | ₱50,000 |
| Doors | Width ≥ 0.90m | ₱30,000 |
| Elevators | Braille buttons | ₱40,000 |
| Parking | 1% PWD slots | ₱25,000 |`,
  },
  {
    id: 'pd1096',
    title: 'PD 1096',
    content: `| Feature | Requirement | Penalty |
|---------|-------------|---------|
| Stairs | Riser ≤ 0.20m | ₱20,000 |
| Corridors | Width ≥ 1.20m | ₱35,000 |
| Exits | Illuminated signs | ₱15,000 |
| Fire exits | Push-bar doors | ₱45,000 |`,
  },
];

const emptyTable = [
  {
    id: 'empty',
    title: 'No Data',
    content: `| Column 1 | Column 2 |
|----------|----------|`,
  },
];

export const Default: Story = {
  args: {
    tables: regulationTables,
  },
};

export const WithDefaultTab: Story = {
  args: {
    tables: regulationTables,
    defaultTab: 'pd1096',
  },
};

export const SingleTable: Story = {
  args: {
    tables: [regulationTables[0]],
  },
};

export const EmptyTable: Story = {
  args: {
    tables: emptyTable,
  },
};

export const ManyTables: Story = {
  args: {
    tables: [
      ...regulationTables,
      {
        id: 'ra7277',
        title: 'RA 7277',
        content: `| Feature | Requirement | Penalty |
|---------|-------------|---------|
| Employment | 1% quota | ₱100,000 |
| Transport | Accessible PUVs | ₱50,000 |`,
      },
      {
        id: 'ra9442',
        title: 'RA 9442',
        content: `| Feature | Requirement | Penalty |
|---------|-------------|---------|
| Discounts | 20% on goods | ₱10,000 |
| Express lanes | Priority service | ₱5,000 |`,
      },
    ],
  },
};
