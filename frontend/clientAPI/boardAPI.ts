import { NewBoard, Board } from "@backend/schema/board.schema";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/boards`;

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        credentials: "include", // Important for sending cookies
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "An error occurred");
    }

    return res.json();
};

export type CreateBoardData = {
    title: string;
    background?: string | null;
};
export type UpdateBoardData = Partial<CreateBoardData>;

export const createBoardAPI = async (data: CreateBoardData): Promise<Board> => {
    return fetchWithAuth(`${API_URL}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const getAllBoardsAPI = async (): Promise<Board[]> => {
    return fetchWithAuth(`${API_URL}`);
};

export const getBoardAPI = async (id: string): Promise<Board> => {
    return fetchWithAuth(`${API_URL}/${id}`);
};

export const updateBoardAPI = async (id: string, data: UpdateBoardData): Promise<Board> => {
    return fetchWithAuth(`${API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteBoardAPI = async (id: string): Promise<void> => {
    return fetchWithAuth(`${API_URL}/${id}`, {
        method: "DELETE",
    });
};
