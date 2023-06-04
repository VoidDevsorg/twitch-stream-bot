import { ICommand } from '../interfaces';

export const Command: ICommand = {
    name: 'add-twitch',
    description: 'Add a twitch channel to the list of channels to be notified when they go live.',
    options: [
        {
            name: 'channel',
            description: 'The channel to add to the list.',
            type: 3,
            required: true
        }
    ],
    run: async (client, interaction) => {
        const channel = interaction.options.get('channel').value as string;
        const twitch = client.twitch;

        if (twitch.getChannels().has(channel)) return interaction.reply({ content: 'This channel is already in the list.', ephemeral: true });
        twitch.addChannel(channel);
        
        interaction.reply({ content: `Successfully added ${channel} to the list of channels to be notified when they go live.`, ephemeral: true });
    }
};