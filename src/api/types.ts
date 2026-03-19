export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

export interface User {
    id: number;
    email: string;
    has_password: boolean;
    profile?: {
        family_name: string;
        global_name: string | null;
        char_class: string | null;
        attack: number | null;
        awakening_attack: number | null;
        defense: number | null;
        gear_score: number | null;
        level: number | null;
    };
    linked_accounts?: Array<{
        provider: string;
        provider_id: string;
        username: string;
        display_name: string | null;
        avatar: string | null;
    }>;
    guild_memberships?: Array<{
        guild: {
            id: number;
            name: string;
            logo_url: string | null;
            invite_slug: string | null;
        };
        role: 'creator' | 'admin' | 'officer' | 'member' | 'pending';
        status: 'active' | 'pending';
    }>;
}

export interface GuildIntegration {
    id: number;
    provider: 'discord' | 'telegram';
    platform_id: string;
    platform_title: string;
    settings: any;
}
