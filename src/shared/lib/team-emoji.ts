export function getTeamEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('курс') || n.includes('диплом') || n.includes('вкр')) return 'GraduationCap';
  if (n.includes('дом') || n.includes('сосед') || n.includes('ремонт')) return 'Wrench';
  if (n.includes('волонтер') || n.includes('помощь')) return 'Heart';
  if (n.includes('спорт') || n.includes('футбол')) return 'Trophy';
  return 'Users';
}
