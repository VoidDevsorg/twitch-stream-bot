import { ClientEvents } from "discord.js";
import VoidClient from "../client";

export interface IEvent {
    name: keyof ClientEvents;
    run: (client: VoidClient, ...args: any[]) => Promise<any> | any;
}
