export function encodeInviteCode(teamId: number): string {
  return teamId.toString(36).toUpperCase().padStart(6, '0');
}
