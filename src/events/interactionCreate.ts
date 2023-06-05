import { Client } from "discord.js";
import { IEvent } from "../interfaces";

export const Event: IEvent = {
  name: "interactionCreate",
  run: (client, interaction) => {
    if (!interaction.isCommand()) return;
    if (!client.commands.has(interaction.commandName)) return;

    try {
      client.commands.get(interaction.commandName).run(client, interaction);
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
