export const formatChatTitle = (firstMessage: string | null): string => {
    if (!firstMessage) return "Новый чат";
    let title = firstMessage.trim().replace(/\n/g, ' ');
    if (title.length === 0) return "Новый чат";
    if (title.length > 35) title = title.slice(0, 35) + '…';
    return title;
};

export const groupSessionsByDate = <T extends { created_at: string }>(sessions: T[]) => {
    const groups: { [key: string]: T[] } = {};
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    sessions.forEach(session => {
        const sessionDate = new Date(session.created_at).getTime();
        let groupKey = '';
        if (sessionDate >= todayStart) groupKey = 'Сегодня';
        else if (sessionDate >= yesterdayStart) groupKey = 'Вчера';
        else groupKey = 'Ранее';
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(session);
    });
    return groups;
};