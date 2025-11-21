import type { CreateTeamData } from '../types';
import { apiClient } from '../../../shared/api'; // ← Добавьте импорт

export const useTeamManagement = () => {
    const createTeam = async (teamData: CreateTeamData) => {
        console.log('Creating team with data:', teamData);
        
        // Вызов API для создания команды
        try {
            const response = await apiClient.createTeam({
                name: teamData.name,
                description: teamData.description,
                user_id: teamData.userId // ← Предполагаемая структура из ваших типов
            });
            return response;
        } catch (error) {
            console.error('Failed to create team:', error);
            throw error;
        }
    };
    
    const inviteMember = async (teamId: string, email: string) => {
        console.log(`Inviting ${email} to team ${teamId}`);
        
        // TODO: Добавить вызов API для приглашения участника
        // когда соответствующий endpoint будет в бэкенде
        // await apiClient.inviteMember(teamId, email);
        
        // Временно возвращаем заглушку
        return Promise.resolve({ success: true });
    };

    const getTeams = async () => {
        try {
            const response = await apiClient.getTeams();
            return response;
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            throw error;
        }
    };
    
    return { createTeam, inviteMember, getTeams }; // ← Добавлен getTeams
};