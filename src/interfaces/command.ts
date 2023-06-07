import { PermissionFlags, CommandInteraction } from "discord.js";
import Client from "../client";
import config from "../config";

interface SubCommand {
    type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
    name: string;
    description: string;
    required?: boolean;
    choices?: { name: string; value: any }[];
}

export interface ICommand {
    name: string;
    description: string;
    options?: SubCommand[];
    only_developer?: boolean;
    cooldown?: number;
    permissions?: (bit: PermissionFlags) => bigint[];
    run: (
        client: Client,
        interaction: CommandInteraction
    ) => Promise<any> | any;
}
