import type { GetUserDTO } from "./get/user.types";

const API_URL = "http://localhost:8080/api/v1";

export async function getUser(username: string): Promise<GetUserDTO> {
  const res = await fetch(`${API_URL}/users?username=${username}`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}