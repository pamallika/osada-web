import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LATEST_CHANGELOG, STORAGE_KEY_CHANGELOG_VERSION } from '../constants/changelog';

export const useChangelog = () => {
    const { token, user, isInitialLoading } = useAuthStore();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const isAuthenticated = !!token && !!user && !isInitialLoading;

    useEffect(() => {
        if (!isAuthenticated) {
            setIsOpen(false);
            return;
        }

        try {
            const lastSeenVersion = localStorage.getItem(STORAGE_KEY_CHANGELOG_VERSION);
            if (lastSeenVersion !== LATEST_CHANGELOG.version) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error checking changelog version from localStorage:', error);
            setIsOpen(false);
        }
    }, [isAuthenticated]);

    const markAsSeen = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY_CHANGELOG_VERSION, LATEST_CHANGELOG.version);
        } catch (error) {
            console.error('Error saving changelog version to localStorage:', error);
        }
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        changelog: LATEST_CHANGELOG,
        markAsSeen
    };
};
