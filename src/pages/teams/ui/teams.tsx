// pages/teams-page.tsx
import React, { useState, useEffect } from 'react';
import { CreateTeamForm } from '@/features/team/create-team-form';
import { apiClient } from '@/shared/api';
import './teams.css';
import type { ApiTeam, CreateTeamResponse } from '@/entities/team/types';

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTeamsFromAPI();
  }, []);

  const loadTeamsFromAPI = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading teams from API...');
      
      const apiTeams: ApiTeam[] = await apiClient.getTeams();
      console.log('✅ RAW API RESPONSE:', apiTeams);
      
      // Проверяем, есть ли команда с id: 26 в сыром ответе
      const team26 = apiTeams.find((team: ApiTeam) => team.id === 26);
      console.log('🔍 Team 26 in raw response:', team26);
      
      // Преобразуем данные из API в наш формат
      const transformedTeams: Team[] = apiTeams.map((team: ApiTeam) => ({
        id: team.id.toString(),
        name: team.name,
        description: team.description || '',
        memberCount: team.members?.length || 1,
        projectCount: 0,
        createdAt: team.created_at
      }));
      
      console.log('📋 Transformed teams:', transformedTeams);
      
      // Ищем команду 26 в преобразованном массиве
      const transformedTeam26 = transformedTeams.find(team => team.id === "26");
      console.log('🔍 Team 26 in transformed teams:', transformedTeam26);
      
      setTeams(transformedTeams);
      
    } catch (error) {
      console.error('❌ Failed to load teams from API:', error);
      alert('Не удалось загрузить список команд');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTeam = async (teamData: { name: string; description: string }) => {
    if (isCreating) {
      console.log('⚠️ Creation already in progress');
      return;
    }
    
    try {
      setIsCreating(true);
      console.log('🔄 Creating team via API...', teamData);
      
      const result: CreateTeamResponse = await apiClient.createTeam({
        name: teamData.name,
        description: teamData.description,
        user_id: 2
      });
      
      console.log('✅ Team created via API:', result);
      setIsCreateModalOpen(false);
      await loadTeamsFromAPI();
      
    } catch (error) {
      console.error('❌ Failed to create team:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Ошибка при создании команды: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    // TODO: Добавить вызов API для удаления
    setTeams(prev => prev.filter(team => team.id !== teamId));
  };

  const handleOpenTeam = (teamId: string) => {
    window.location.href = `/team/${teamId}`;
  };

  if (isLoading) {
    return (
      <div className="teams-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка команд...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="teams-header">
        <div className="header-content">
          <h1>Мои команды</h1>
        </div>
        <button 
          className="create-team-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Создать команду
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>У вас пока нет команд</h3>
          <p>Создайте первую команду чтобы начать работу над проектами</p>
          <button 
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Создать команду
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <div className="team-header">
                <h3>{team.name}</h3>
                <button 
                  className="delete-team-btn"
                  onClick={() => handleDeleteTeam(team.id)}
                  title="Удалить команду"
                >
                  ×
                </button>
              </div>
              
              <p className="team-description">{team.description}</p>
              
              <div className="team-stats">
                <div className="stat">
                  <span className="stat-value">{team.memberCount}</span>
                  <span className="stat-label">участников</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{team.projectCount}</span>
                  <span className="stat-label">проектов</span>
                </div>
              </div>
              
              <div className="team-actions">
                <button 
                  className="btn-outline"
                  onClick={() => handleOpenTeam(team.id)}
                >
                  Открыть команду
                </button>
                <button className="btn-secondary">Управление</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTeamForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
        isLoading={isCreating}
      />
    </div>
  );
};