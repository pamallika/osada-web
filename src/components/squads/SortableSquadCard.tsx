import type { FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SquadCardBase, type SquadCardBaseProps } from './SquadCardBase';

export const SortableSquadCard: FC<Omit<SquadCardBaseProps, 'setNodeRef' | 'style' | 'attributes' | 'listeners' | 'isDragging' | 'isOverlay'>> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.squad.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <SquadCardBase
             {...props}
             setNodeRef={setNodeRef}
             style={style}
             attributes={attributes}
             listeners={listeners}
             isDragging={isDragging}
        />
    );
};
