export interface ChangelogItem {
    id: string;
    type: 'feature' | 'improvement' | 'fix';
    title: string;
    description: string;
    icon?: string;
}

export interface ChangelogRelease {
    version: string;
    title: string;
    date: string;
    description?: string;
    badge?: string;
    changes: ChangelogItem[];
}

export const STORAGE_KEY_CHANGELOG_VERSION = 'sage_last_seen_changelog_version';

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
    {
        version: '1.4.0',
        title: 'Официальный запуск сайта SAGE v1.4.0',
        date: '7 августа 2026',
        badge: 'Крупное обновление',
        description: 'Мы рады представить новую визитную карточку нашей платформы! Официальный сайт поможет главам гильдий быстрее понять всю мощь автоматизации SAGE.',
        changes: [
            {
                id: 'official-landing-page',
                type: 'feature',
                title: 'Официальный сайт проекта https://landing.arigami.space',
                description: 'Запущен презентационный лендинг с красивыми анимациями и подробным описанием возможностей. Зовите друзей и другие гильдии!',
                icon: '🌐'
            },
            {
                id: 'mobile-responsive-ui',
                type: 'improvement',
                title: 'Идеально на смартфонах',
                description: 'Была проведена серьезная работа над ошибками вёрстки: убрали двойные скроллы, настроили шрифты и отступы для максимального удобства с телефона.',
                icon: '📱'
            },
            {
                id: 'avatar-system-unification',
                type: 'improvement',
                title: 'Единая система аватарок пользователей',
                description: 'Аватарки со всех платформ (Discord, Telegram или загруженный файл) теперь единообразно подтягиваются во все списки и профили.',
                icon: '🖼️'
            },
            {
                id: 'avatar-fallback-initials',
                type: 'fix',
                title: 'Умный фоллбэк и исправление списков событий',
                description: 'Исправлено отображение аватарок в списках «Не определились» и «Пропустят». При отсутствии аватарки или сетевых сбоях автоматически рисуется буква-инициал на стильном градиенте.',
                icon: '👤'
            },
        ]
    },
    {
        version: '1.3.0',
        title: 'Обновление профиля и аналитики SAGE v1.3.0',
        date: '1 августа 2026',
        badge: 'Новая версия',
        description: 'Встречайте масштабный редизайн страницы профиля, новую систему вкладок экипировки, усовершенствованную аналитику и более приятную модалку выбора классов.',
        changes: [
            {
                id: 'yandex-browser-ssl-optimization',
                type: 'fix',
                title: 'Оптимизация загрузки в Яндекс Браузере',
                description: 'Внедрен протокол OCSP Stapling для ускорения проверки SSL-сертификатов. Приложение и сайт теперь загружаются мгновенно во всех браузерах.',
                icon: '🌐'
            },
            {
                id: 'changelog-notifications',
                type: 'feature',
                title: 'Уведомления "Что нового"',
                description: 'Автоматические оповещения об обновлениях системы для всех авторизованных пользователей в Telegram Mini App и Web.',
                icon: '🚀'
            },
            {
                id: 'profile-redesign-tabs',
                type: 'feature',
                title: 'Редизайн страницы Профиля',
                description: 'Профиль разделен на чистые вкладки "Аккаунт" и "Экипировка". Добавлено инлайн-редактирование фамилии персонажа с автосохранением.',
                icon: '👤'
            },
            {
                id: 'bdo-class-select-modal',
                type: 'feature',
                title: 'Удобное модальное окно выбора класса',
                description: 'Появился удобный список классов BDO с поиском по названию (Агента), адаптированный под любые экраны.',
                icon: '⚔️'
            },
            {
                id: 'gear-history',
                type: 'feature',
                title: 'Отслеживание истории Gear Score',
                description: 'В профиле появился подробный график и таблица истории изменения показателей атаки, пробужденной атаки и защиты.',
                icon: '⚔️'
            },
            {
                id: 'guild-gear-tracking',
                type: 'feature',
                title: 'Отслеживание гира всей гильдии',
                description: 'Офицеры теперь могут просматривать и анализировать экипировку всех участников гильдии. Рядовые пользователи видят только свой профиль.',
                icon: '🛡️'
            },
            {
                id: 'chat-media-improvements',
                type: 'feature',
                title: 'Мультимедиа в чатах и безопасность',
                description: 'В чатах теперь можно отправлять до 5 картинок за раз. Все медиафайлы надежно защищены и автоматически конвертируются в легкий формат WebP.',
                icon: '🖼️'
            },
            {
                id: 'gear-analytics-tabs',
                type: 'improvement',
                title: 'Обновленная аналитика экипировки',
                description: 'В блоке аналитики выделены подвкладки "Общее", "График" и "История". В "Общем" выведены стартовый/текущий GS и параметры.',
                icon: '📈'
            },
            {
                id: 'garmoth-save-flow',
                type: 'improvement',
                title: 'Контроль синхронизации Garmoth.com',
                description: 'Синхронизация профиля Garmoth теперь происходит строго по кнопке "Сохранить" без случайных автозапросов при смене вкладок.',
                icon: '⚡'
            },
            {
                id: 'manual-gear-save-button',
                type: 'improvement',
                title: 'Кнопка сохранения ручного ввода',
                description: 'Добавлена отдельная кнопка "Сохранить" для ручного ввода AP/AAP/DP рядом с отправкой на верификацию.',
                icon: '💾'
            },
            {
                id: 'tma-ui-fixes',
                type: 'fix',
                title: 'Исправления TMA и iOS',
                description: 'Улучшена обработка безопасных зон (safe-area-inset), отклики нажатий и предотвращено выделение текста при свайпах.',
                icon: '🛠️'
            }
        ]
    },
    {
        version: '1.2.0',
        title: 'Большое обновление SAGE v1.2.0',
        date: '1 августа 2026',
        badge: 'Новая версия',
        description: 'Мы подготовили важные улучшения в отслеживании параметров персонажа, истории снаряжения и удобстве работы с интерфейсом.',
        changes: [
            {
                id: 'gear-history',
                type: 'feature',
                title: 'Отслеживание истории Gear Score',
                description: 'В профиле появился подробный график и таблица истории изменения показателей атаки, пробужденной атаки и защиты.',
                icon: '⚔️'
            },
            {
                id: 'changelog-notifications',
                type: 'feature',
                title: 'Уведомления "Что нового"',
                description: 'Автоматические оповещения об обновлениях системы для всех авторизованных пользователей в Telegram Mini App и Web.',
                icon: '🚀'
            },
            {
                id: 'class-selector',
                type: 'improvement',
                title: 'Оптимизация выбора класса BDO',
                description: 'Обновлена визуализация селектора классов с подгрузкой иконок и быстрым поиском ролей.',
                icon: '🎨'
            },
            {
                id: 'tma-ui-fixes',
                type: 'fix',
                title: 'Исправления TMA и iOS',
                description: 'Улучшена обработка безопасных зон (safe-area-inset), отклики нажатий и предотвращено выделение текста при свайпах.',
                icon: '🛠️'
            }
        ]
    }
];

export const LATEST_CHANGELOG: ChangelogRelease = CHANGELOG_RELEASES[0];
