import {
  DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Lock dragging to the vertical axis.
const restrictToVertical = ({ transform }) => ({ ...transform, x: 0 });

/** Vertical sortable list. items must have `id`. onReorder receives the new array. */
export function SortableList({ items, onReorder, children, strategy = verticalListSortingStrategy }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVertical]}>
      <SortableContext items={items.map((i) => i.id)} strategy={strategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/** Render-prop sortable item: children({ handleProps, isDragging }). */
export function SortableItem({ id, children, className = '' }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: 'relative',
  };
  return (
    <div ref={setNodeRef} style={style} className={`${className} ${isDragging ? 'opacity-80 shadow-lg' : ''}`}>
      {children({ handleProps: { ...attributes, ...listeners }, isDragging })}
    </div>
  );
}
