import { FC, useState, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { BDO_CLASSES, type BdoClass } from '../constants/bdo';
import { cn } from '../lib/utils';

interface ClassSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedClassId: string;
    onSelectClass: (classId: string) => Promise<void> | void;
    isSaving?: boolean;
}

export const ClassSelectModal: FC<ClassSelectModalProps> = ({
    isOpen,
    onClose,
    selectedClassId,
    onSelectClass,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingClassId, setPendingClassId] = useState<string | null>(null);

    // Filter classes strictly by search query
    const filteredClasses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return BDO_CLASSES;
        return BDO_CLASSES.filter((c) =>
            c.nameRu.toLowerCase().includes(query) ||
            c.nameEn.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleSelect = async (c: BdoClass) => {
        setPendingClassId(c.id);
        try {
            await onSelectClass(c.id);
            onClose();
        } finally {
            setPendingClassId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Выбор класса"
            maxWidth="md"
            alignTop={true}
        >
            <div className="space-y-3.5 select-none">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по названию..."
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-all"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Single Column List constrained to 55% of viewport height */}
                <div className="max-h-[55vh] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {filteredClasses.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500 text-xs">
                            Класс не найден
                        </div>
                    ) : (
                        filteredClasses.map((c) => {
                            const isCurrentSelected =
                                selectedClassId.toLowerCase() === c.id.toLowerCase() ||
                                selectedClassId.toLowerCase() === c.nameEn.toLowerCase();
                            const isThisPending = pendingClassId === c.id;

                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelect(c)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group",
                                        isCurrentSelected
                                            ? "bg-violet-600/20 border-violet-500/60 text-white font-bold shadow-sm"
                                            : "bg-zinc-900/50 border-white/[0.04] text-zinc-300 hover:bg-zinc-900 hover:border-white/10 hover:text-white"
                                    )}
                                >
                                    <span className="text-sm">
                                        {c.nameRu} <span className="text-xs text-zinc-500 font-normal group-hover:text-zinc-400">({c.nameEn})</span>
                                    </span>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {isThisPending ? (
                                            <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                                        ) : isCurrentSelected ? (
                                            <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs shadow-sm">
                                                ✓
                                            </span>
                                        ) : null}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
};
