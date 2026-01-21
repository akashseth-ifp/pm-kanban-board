import { Board } from "@backend/schema/board.schema";
import { fetchWithAuth } from "./helper";
import { BoardEvent } from "@backend/schema/board-events.schema";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/boards`;

export const getAllBoardsAPI = async (): Promise<Board[]> => {
  return fetchWithAuth(`${API_URL}`);
};

export const createBoardAPI = async (title: string): Promise<Board> => {
  return fetchWithAuth(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
};

// Fetch single board with table row
export const getBoardAPI = async (boardId: string): Promise<Board> => {
  return fetchWithAuth(`${API_URL}/${boardId}`);
};

export const getBoardEventsAPI = async (
  boardId: string,
  fromVersion: number
): Promise<BoardEvent[]> => {
  return fetchWithAuth(
    `${API_URL}/${boardId}/events?from_version=${fromVersion}`
  );
};

export const inviteUserAPI = async (
  boardId: string,
  email: string,
  role: string
): Promise<void> => {
  return fetchWithAuth(`${API_URL}/${boardId}/invite`, {
    method: "POST",
    body: JSON.stringify({
      email,
      role,
    }),
  });
};

export const acceptInviteAPI = async (
  inviteToken: string
): Promise<{ message: string; boardId: string }> => {
  return fetchWithAuth(`${API_URL}/accept-invite`, {
    method: "POST",
    body: JSON.stringify({
      inviteToken,
    }),
  });
};

export const getBoardMembersAPI = async (
  boardId: string
): Promise<{
  activeMembers: Array<{
    id: string;
    role: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }>;
  pendingInvites: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
}> => {
  return fetchWithAuth(`${API_URL}/${boardId}/members`);
};

export const deleteBoardMemberAPI = async (
  boardId: string,
  memberId: string
): Promise<{ message: string }> => {
  return fetchWithAuth(`${API_URL}/${boardId}/members/${memberId}`, {
    method: "DELETE",
  });
};

export const updateBoardMemberRoleAPI = async (
  boardId: string,
  memberId: string,
  role: string
): Promise<{ message: string }> => {
  return fetchWithAuth(`${API_URL}/${boardId}/members/${memberId}`, {
    method: "PATCH",
    body: JSON.stringify({
      role,
    }),
  });
};
