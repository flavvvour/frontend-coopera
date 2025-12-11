
// import { useState } from 'react'
// import { useHookGetUser } from "../../hooks/useHookGetUser";

// export default function TeamsPage({ username }: { username: string }) {
//   const { data, loading, error } = useHookGetUser(username);

//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const teams = data?.teams;

//   if (loading) {
//     return <div className="teams-page">Загрузка...</div>;
//   }

//   if (error) {
//     return <div className="teams-page">Ошибка: {error.message}</div>;
//   }

//   return (
//     <div className="teams-page">
//       {/* HEADER */}
//       <div className="teams-header">
//         <div className="header-content">
//           <h1>Мои команды</h1>
//           <p>Управляйте вашими командами и проектами</p>
//         </div>

//         <button
//           className="create-team-btn"
//           onClick={() => setIsCreateModalOpen(true)}
//           disabled={!data}
//         >
//           + Создать команду
//         </button>
//       </div>

//       {/* EMPTY STATE */}
//       {teams.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-icon">👥</div>
//           <h3>У вас пока нет команд</h3>
//           <p>Создайте первую команду чтобы начать работу над задачами</p>

//           <button
//             className="btn-primary"
//             onClick={() => setIsCreateModalOpen(true)}
//             disabled={!data}
//           >
//             Создать команду
//           </button>
//         </div>
//       ) : (
//         /* TEAMS GRID */
//         <div className="teams-grid">
//           {teams.map((team) => (
//             <div
//               key={team.id}
//               className="team-card"
//               onClick={() => team.id && handleOpenTeam(team.id)}
//               style={{ cursor: "pointer" }}
//             >
//               {/* CARD HEADER */}
//               <div className="team-card-header">
//                 <div className="team-icon-wrapper">
//                   <svg className="team-icon" viewBox="0 0 24 24" fill="none">
//                     <path
//                       d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     />
//                     <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
//                     <path
//                       d="M23 21v-2a4 4 0 0 0-3-3.87"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     />
//                     <path
//                       d="M16 3.13a4 4 0 0 1 0 7.75"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     />
//                   </svg>
//                 </div>

//                 <button
//                   className="delete-team-btn"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (team.id) handleDeleteTeam(team.id);
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

//               {/* CARD CONTENT */}
//               <div className="team-content">
//                 <h3 className="team-name">{team.name}</h3>

//                 <p className="team-description">
//                   Создана {team.createdAt.toLocaleDateString("ru-RU")}
//                 </p>
//               </div>

//               {/* FOOTER */}
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

//                   <span>{team.members?.length  0} участников</span>
//                 </div>

//                 <div className="team-date">
//                   {team.createdAt.toLocaleDateString("ru-RU", {
//                     day: "numeric",
//                     month: "short",
//                   })}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* CREATE TEAM MODAL */}
//       <CreateTeamForm
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onCreateTeam={handleCreateTeam}
//         isLoading={isCreating}
//       />
//     </div>
//   );
// }
//  import { useState } from 'react'
import { useHookGetUser } from "../../hooks/useHookGetUser";
export function UserComponentPage({ username }: { username: string }) {
  const { data, loading, error } = useHookGetUser(username);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  if (!data) return <p>Пользователь не найден</p>;

  return (
    <div>
      <h2>Команды пользователя {data.username}</h2>
      <ul>
        {data.teams.map(team => (
          <li key={team.id}>
            {team.name} — {team.role}
          </li>
        ))}
      </ul>
    </div>
  );
}