// // teams-page.tsx - исправленная версия
// import React, { useState, useEffect } from 'react';
// import { CreateTeamForm } from '@/features/team/create-team-form';
// import type { Team } from '@/entities/team';
// import { apiClient } from '@/shared/api/client';
// import { useUserStore } from '@/entities/user/user-store';
// import { userMapper } from '@/shared/lib/userMapper';
// import './teams.css';

// // Добавьте базовый URL для API
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// export const TeamsPage: React.FC = () => {
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isCreating, setIsCreating] = useState(false);
//   const { user } = useUserStore();

//   // Загрузка команд пользователя
//   // В teams.tsx, внутри функции loadUserTeams
//   const loadUserTeams = async () => {
//   try {
//     setIsLoading(true);

//     // 🧤 Проверяем наличие username
//     if (!user?.username) {
//       setTeams([]);
//       return;
//     }

//     // 🧵 Формируем URL
//     const url = `${API_BASE_URL}/users?Username=${user.username}`;

//     // 📡 Отправляем запрос
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error: ${response.status}`);
//     }

//     // 📦 Парсим ответ
//     const data = await response.json();

//     // 🎯 Извлекаем команды напрямую
//     const userTeams = data.teams || [];

//     // 🔍 Лог (при необходимости)
//     console.log("User teams:", userTeams);

//     // 📌 Приводим список команд к удобному виду (можно менять под UI)
//     const parsedTeams = userTeams.map((team: any) => ({
//       id: team.id,
//       name: team.name,
//       role: team.role,
//     }));

//     // 💾 Сохраняем в state
//     setTeams(parsedTeams);
//   } catch (error) {
//     console.error("Failed to load user teams:", error);
//     setTeams([]);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // Удаление команды
//   const handleDeleteTeam = async (teamId: number | undefined) => {
//     if (!user || !teamId) return;

//     const team = teams.find(t => t.id === teamId);
//     if (!team) return;

//     const confirmed = window.confirm(
//       `Вы уверены, что хотите удалить команду "${team.name}"?\n\nЭто действие нельзя отменить.`
//     );

//     if (!confirmed) return;

//     try {
//       // Используйте ApiClient, который уже знает правильный формат
//       await apiClient.deleteTeam(teamId, user.id);

//       console.log('Team deleted successfully');
//       setTeams(prev => prev.filter(t => t.id !== teamId));
//     } catch (error) {
//       console.error('Failed to delete team:', error);

//       let errorMessage = 'Не удалось удалить команду';
//       if (error instanceof Error) {
//         errorMessage = `Не удалось удалить команду: ${error.message}`;
//       }

//       alert(errorMessage);
//     }
//   };

//   // Переход в команду
//   const handleOpenTeam = (teamId: number | undefined) => {
//     if (!teamId) {
//       console.error('Cannot open team: teamId is undefined');
//       return;
//     }
//     window.location.href = `/dashboard/teams/${teamId}`;
//   };

//   if (isLoading) {
//     return (
//       <div className="teams-page">
//         <div className="loading-state">
//           <div className="loading-spinner"></div>
//           <p>Загрузка команд...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="teams-page">
//       <div className="teams-header">
//         <div className="header-content">
//           <h1>Мои команды</h1>
//           <p>Управляйте вашими командами и проектами</p>
//         </div>
//         <button
//           className="create-team-btn"
//           onClick={() => setIsCreateModalOpen(true)}
//           disabled={!user}
//         >
//           + Создать команду
//         </button>
//       </div>

//       {teams.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-icon">👥</div>
//           <h3>У вас пока нет команд</h3>
//           <p>Создайте первую команду чтобы начать работу над задачами</p>
//           <button
//             className="btn-primary"
//             onClick={() => setIsCreateModalOpen(true)}
//             disabled={!user}
//           >
//             Создать команду
//           </button>
//         </div>
//       ) : (
//         <div className="teams-grid">
//           {teams.map(team => (
//             <div
//               key={team.id!}
//               className="team-card"
//               onClick={() => team.id && handleOpenTeam(team.id)}
//               style={{ cursor: 'pointer' }}
//             >
//               <div className="team-card-header">
//                 <div className="team-icon-wrapper">
//                   <svg className="team-icon" viewBox="0 0 24 24" fill="none">
//                     <path
//                       d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     />
//                     <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
//                     <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" />
//                     <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" />
//                   </svg>
//                 </div>
//                 <button
//                   className="delete-team-btn"
//                   onClick={e => {
//                     e.stopPropagation();
//                     if (team.id) {
//                       // Добавьте проверку
//                       handleDeleteTeam(team.id!);
//                     }
//                   }}
//                   title="Удалить команду"
//                 >
//                   <svg viewBox="0 0 24 24" fill="none">
//                     <path d="M3 6h18" stroke="currentColor" strokeWidth="2" />
//                     <path
//                       d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               <div className="team-content">
//                 <h3 className="team-name">{team.name}</h3>
//                 <p className="team-description">
//                   Создана {new Date(team.createdAt).toLocaleDateString('ru-RU')}
//                 </p>
//               </div>

//               <div className="team-footer">
//                 <div className="team-meta">
//                   <svg className="meta-icon" viewBox="0 0 24 24" fill="none">
//                     <path
//                       d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     />
//                     <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
//                   </svg>
//                   <span>{team.members?.length || 0} участников</span>
//                 </div>
//                 <div className="team-date">
//                   {new Date(team.createdAt).toLocaleDateString('ru-RU', {
//                     day: 'numeric',
//                     month: 'short',
//                   })}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <CreateTeamForm
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onCreateTeam={handleCreateTeam}
//         isLoading={isCreating}
//       />
//     </div>
//   );
// };
