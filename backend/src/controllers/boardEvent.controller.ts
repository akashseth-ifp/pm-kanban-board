import { Request, Response, NextFunction } from "express";
import {
  updateBoardEvent,
  UpdateBoardEventResponse,
} from "../boardEvents/updateBoard.event";
import {
  deleteBoardEvent,
  DeleteBoardEventResponse,
} from "../boardEvents/deleteBoard.event";
import {
  getBoardEvent,
  GetBoardEventResponse,
} from "../boardEvents/getBoard.event";
import {
  addListEvent,
  AddListEventResponse,
} from "../boardEvents/addList.event";
import {
  updateListEvent,
  UpdateListEventResponse,
} from "../boardEvents/updateList.event";
import {
  deleteListEvent,
  DeleteListEventResponse,
} from "../boardEvents/deleteList.event";
import {
  addTicketEvent,
  AddTicketEventResponse,
} from "../boardEvents/addTicket.event";
import {
  updateTicketEvent,
  UpdateTicketEventResponse,
} from "../boardEvents/updateTicket.event";
import {
  deleteTicketEvent,
  DeleteTicketEventResponse,
} from "../boardEvents/deleteTicket.event";
import { getIO } from "../lib/socket";

export const boardEventPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventType, boardId } = req.body;
    const userId = req.user!.id;

    req.log.info(`Event Type: ${eventType}`);
    req.log.info(
      `Event Data: ${JSON.stringify({ userId, ...req.body }, null, 2)}`
    );

    let result:
      | UpdateBoardEventResponse
      | DeleteBoardEventResponse
      | GetBoardEventResponse
      | AddListEventResponse
      | UpdateListEventResponse
      | DeleteListEventResponse
      | AddTicketEventResponse
      | UpdateTicketEventResponse
      | DeleteTicketEventResponse;

    if (eventType === "UPDATE_BOARD") {
      result = await updateBoardEvent(req.body, userId);
    } else if (eventType === "DELETE_BOARD") {
      result = await deleteBoardEvent(req.body, userId);
    } else if (eventType === "GET_BOARD") {
      result = await getBoardEvent(req.body, userId);
    } else if (eventType === "ADD_LIST") {
      result = await addListEvent(req.body, userId);
    } else if (eventType === "UPDATE_LIST") {
      result = await updateListEvent(req.body, userId);
    } else if (eventType === "DELETE_LIST") {
      result = await deleteListEvent(req.body, userId);
    } else if (eventType === "ADD_TICKET") {
      result = await addTicketEvent(req.body, userId);
    } else if (eventType === "UPDATE_TICKET") {
      result = await updateTicketEvent(req.body, userId);
    } else if (eventType === "DELETE_TICKET") {
      result = await deleteTicketEvent(req.body, userId);
    } else {
      res.status(400).json({ message: "Event not found: " + eventType });
      return;
    }

    // Emit the event to the board room
    if (eventType !== "GET_BOARD") {
      const io = getIO();
      io.to(boardId).emit("boardEvent", result);
    }

    res.status(200).json(result);
  } catch (error) {
    req.log.error(`Event Post Handler Error: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
