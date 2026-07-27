export interface BdoClass {
    id: string;
    nameEn: string;
    nameRu: string;
    role?: 'frontline' | 'ranged' | 'support' | 'flank';
}

export const BDO_CLASSES: BdoClass[] = [
    { id: 'Warrior', nameEn: 'Warrior', nameRu: 'Воин', role: 'frontline' },
    { id: 'Ranger', nameEn: 'Ranger', nameRu: 'Лучник', role: 'ranged' },
    { id: 'Sorceress', nameEn: 'Sorceress', nameRu: 'Колдунья', role: 'flank' },
    { id: 'Berserker', nameEn: 'Berserker', nameRu: 'Варвар', role: 'frontline' },
    { id: 'Tamer', nameEn: 'Tamer', nameRu: 'Мистик', role: 'flank' },
    { id: 'Musa', nameEn: 'Musa', nameRu: 'Мастер меча', role: 'flank' },
    { id: 'Maehwa', nameEn: 'Maehwa', nameRu: 'Маэва', role: 'flank' },
    { id: 'Valkyrie', nameEn: 'Valkyrie', nameRu: 'Валькирия', role: 'frontline' },
    { id: 'Kunoichi', nameEn: 'Kunoichi', nameRu: 'Куноичи', role: 'flank' },
    { id: 'Ninja', nameEn: 'Ninja', nameRu: 'Ниндзя', role: 'flank' },
    { id: 'Wizard', nameEn: 'Wizard', nameRu: 'Волшебник', role: 'ranged' },
    { id: 'Witch', nameEn: 'Witch', nameRu: 'Волшебница', role: 'ranged' },
    { id: 'Dark Knight', nameEn: 'Dark Knight', nameRu: 'Тёмный рыцарь', role: 'flank' },
    { id: 'Striker', nameEn: 'Striker', nameRu: 'Страйкер', role: 'flank' },
    { id: 'Mystic', nameEn: 'Mystic', nameRu: 'Фурия', role: 'frontline' },
    { id: 'Lahn', nameEn: 'Lahn', nameRu: 'Лан', role: 'flank' },
    { id: 'Archer', nameEn: 'Archer', nameRu: 'Лучник', role: 'ranged' },
    { id: 'Shai', nameEn: 'Shai', nameRu: 'Шай', role: 'support' },
    { id: 'Guardian', nameEn: 'Guardian', nameRu: 'Страж', role: 'frontline' },
    { id: 'Hashashin', nameEn: 'Hashashin', nameRu: 'Хасашин', role: 'flank' },
    { id: 'Nova', nameEn: 'Nova', nameRu: 'Нова', role: 'frontline' },
    { id: 'Sage', nameEn: 'Sage', nameRu: 'Мудрец', role: 'ranged' },
    { id: 'Corsair', nameEn: 'Corsair', nameRu: 'Корсар', role: 'flank' },
    { id: 'Drakania', nameEn: 'Drakania', nameRu: 'Драканиа', role: 'flank' },
    { id: 'Woosa', nameEn: 'Woosa', nameRu: 'Уса', role: 'ranged' },
    { id: 'Maegu', nameEn: 'Maegu', nameRu: 'Мэгу', role: 'ranged' },
    { id: 'Scholar', nameEn: 'Scholar', nameRu: 'Сколярия', role: 'flank' },
    { id: 'Dosa', nameEn: 'Dosa', nameRu: 'Тоса', role: 'flank' },
    { id: 'Seraph', nameEn: 'Seraph', nameRu: 'Сераф', role: 'flank' },
    { id: 'Deadeye', nameEn: 'Deadeye', nameRu: 'Мёртвый глаз', role: 'ranged' },
];

export function getBdoClassName(classId: string | null | undefined, lang: 'ru' | 'en' = 'ru'): string {
    if (!classId) return '';
    const found = BDO_CLASSES.find(c => c.id.toLowerCase() === classId.toLowerCase() || c.nameEn.toLowerCase() === classId.toLowerCase());
    if (!found) return classId;
    return lang === 'ru' ? `${found.nameRu} (${found.nameEn})` : found.nameEn;
}
