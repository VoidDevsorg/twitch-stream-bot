import { Client } from "discord.js";
import { IEvent } from "../interfaces";

export const Event: IEvent = {
    name: 'ready',
    run: (client) => {
        console.success(`Logged in as ${client.user.tag}!`);
    }
}