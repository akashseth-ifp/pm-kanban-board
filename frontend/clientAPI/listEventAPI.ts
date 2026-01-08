import { List } from "@backend/schema/list.schema";
import { fetchWithAuth } from "./helper";
import { AddListEvent } from "@backend/boardEvents/addList.event";
import { UpdateListEvent } from "@backend/boardEvents/updateList.event";
import { DeleteListEvent } from "@backend/boardEvents/deleteList.event";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/event`;

export const addListAPI = async (data: Omit<AddListEvent, 'eventType'>): Promise<List> => {
    try {
        const { data: resData } = await fetchWithAuth(`${API_URL}`, {
            method: "POST",
            body: JSON.stringify({ eventType: "ADD_LIST", ...data }),
        });
        return resData;
    } catch (error) {
        throw error;
    }
};

export const updateListAPI = async (data: Omit<UpdateListEvent, 'eventType'>): Promise<List> => {
    try {
        const { data: resData } = await fetchWithAuth(`${API_URL}`, {
            method: "POST",
            body: JSON.stringify({ eventType: "UPDATE_LIST", ...data }),
        });
        return resData;
    } catch (error) {
        throw error;
    }
};

export const deleteListAPI = async (data: Omit<DeleteListEvent, 'eventType'>): Promise<void> => {
    return fetchWithAuth(`${API_URL}`, {
        method: "POST",
        body: JSON.stringify({ eventType: "DELETE_LIST", ...data }),
    });
};

export const getListsAPI = async (boardId: string): Promise<List[]> => {
    // Stub for now
    return [];
};