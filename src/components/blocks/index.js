import { CheckSquare, Hash, Images, Table, Type } from 'lucide-react';
import TextBlock from './TextBlock';
import ChecklistBlock from './ChecklistBlock';
import TableBlock, { defaultTable } from './TableBlock';
import GalleryBlock from './GalleryBlock';
import TrackerBlock, { defaultTracker } from './TrackerBlock';

export const BLOCK_TYPES = {
  text: { label: 'Text / Notes', icon: Type, component: TextBlock, init: () => ({ text: '' }) },
  checklist: { label: 'Checklist', icon: CheckSquare, component: ChecklistBlock, init: () => ({ items: [] }) },
  table: { label: 'Table', icon: Table, component: TableBlock, init: defaultTable },
  gallery: { label: 'Image Gallery', icon: Images, component: GalleryBlock, init: () => ({ imageIds: [] }) },
  tracker: { label: 'Number Tracker', icon: Hash, component: TrackerBlock, init: defaultTracker },
};
