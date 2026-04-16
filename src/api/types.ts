export interface ApiResponse<T> { // v1.1
    status: 'success' | 'error';
    data: T;
    message?: string;
}

export interface User {
    id: number;
    email: string | null;
    name: string;
    has_password: boolean;
    avatar_url: string | null;
    profile: UserProfile;
    linked_accounts?: LinkedAccount[];
    guild_memberships?: GuildMembership[];
}

export interface UserProfile {
    family_name: string | null;
    global_name: string | null;
    char_class: string | null;
    attack: number;
    awakening_attack: number;
    defense: number;
    gear_score: number;
}

export interface UserGearMedia {
    id: number;
    user_id: number;
    url: string;
    label: string | null;
    is_draft: boolean;
    size: number;
    created_at: string;
}

export interface LinkedAccount {
    id: number;
    provider: 'discord' | 'telegram';
    provider_id: string;
    username: string | null;
    display_name: string | null;
    avatar: string | null;
}

export interface Guild {
    id: number;
    name: string;
    logo_url: string | null;
    description: string | null;
    invite_slug: string | null;
    is_public?: boolean;
    status: 'active' | 'inactive';
    members_count?: number;
}

export interface GuildMembership {
    id: number;
    guild: Guild;
    user?: User;
    role: 'creator' | 'admin' | 'officer' | 'member' | 'pending';
    status: 'active' | 'pending';
    verification_status: 'incomplete' | 'pending' | 'verified' | 'updated';
    verified_by?: {
        id: number;
        name: string;
        profile: { family_name: string }
    } | null;
    verified_at?: string | null;
    joined_at?: string | null;
}

export interface GuildIntegration {
    id: number;
    provider: 'discord' | 'telegram';
    platform_id: string;
    platform_title: string;
    settings: any;
}

export interface Post {
    id: number;
    guild_id: number;
    user_id: number;
    title: string;
    content: string;
    author?: User | null;
    created_at: string;
    updated_at: string;
}

export interface PostMedia {
    url: string;
}

export interface PublicGuildList {
    id: number;
    name: string;
    invite_slug: string | null;
    logo_url: string | null;
    members_count: number;
}

export interface PublicGuildProfile {
    id: number;
    name: string;
    invite_slug: string | null;
    logo_url: string | null;
    creator_family_name: string | null;
    members_count: number;
}

export interface PublicGuildMember {
    family_name: string | null;
    joined_at: string;
    days_in_guild: number;
}

export interface GuildHistoryEvent {
    action: 'join' | 'leave' | 'kick';
    family_name: string | null;
    created_at: string;
}
