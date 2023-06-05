import { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { join } from "path";
import { ICommand, IEvent } from "../interfaces";
import glob from "glob";
import config from "../config";
import { Twitch } from "@voidpkg/social-alert";

export default class VoidClient extends Client {
  public readonly config = config;
  public readonly commands: Collection<string, ICommand> = new Collection();
  public twitch: Twitch;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  public async run(): Promise<void> {
    this.loadCommands()
      .loadEvents()
      .login(this.config.token)
      .then(() => {
        this.postCommands();
        this.connectTwitch();
      });
  }

  public postCommands() {
    const rest = new REST({ version: "10" }).setToken(this.config.token);
    console.info("Started loading application (/) commands...");

    rest
      .put(Routes.applicationCommands(this.user.id), {
        body: this.commands.toJSON(),
      })
      .then(() => {
        console.success(
          `Successfully loaded [${this.commands.size}] application (/) commands.`
        );
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });

    return this;
  }

  private loadCommands(): VoidClient {
    glob(
      "**/*.ts",
      { cwd: join(__dirname, "../commands") },
      async (err, files) => {
        if (err) return console.error(err);
        if (files.length === 0)
          return console.warn(
            "No commands were found in the commands file, this part is skipped.."
          );

        files.forEach(async (file, i) => {
          const { Command }: { Command: ICommand } = await import(
            `../commands/${file}`
          );
          this.commands.set(Command.name, Command);
          if (i + 1 === files.length)
            console.success(`Successfully loaded ${files.length} commands.`);
        });
      }
    );

    return this;
  }

  private loadEvents(): VoidClient {
    glob(
      "**/*.ts",
      { cwd: join(__dirname, "../events") },
      async (err, files) => {
        if (err) return console.error(err);
        if (files.length === 0)
          return console.warn(
            "No events were found in the events file, this part is skipped.."
          );

        files.forEach(async (file, i) => {
          const { Event }: { Event: IEvent } = await import(
            `../events/${file}`
          );
          this.on(Event.name, Event.run.bind(null, this));
          if (i + 1 === files.length)
            console.success(`Successfully loaded ${files.length} events.`);
        });
      }
    );

    return this;
  }

  private announceLive(stream: any) {
    const guild = this.guilds.cache.get("1114895293956243576");

    const watch = new ButtonBuilder()
      .setLabel("Watch on Twitch")
      .setEmoji("<:twitch_2:1114965598502387794>")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://twitch.tv/${stream.user_login}`);

    const row: any = new ActionRowBuilder().addComponents(watch);

    (guild.channels.cache.get("1114960245148614806") as TextChannel)
      .send({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: stream.user_name, iconURL: guild.iconURL() })
            .setTitle(stream.title)
            .setURL(`https://twitch.tv/${stream.user_login}`)
            .setDescription(
              `${stream.user_name} is now live on [Twitch](https://twitch.tv/${stream.user_login})`
            )
            .setColor(0x6441a5)
            .addFields(
              {
                name: "Game",
                value: (stream.game_name || "N/A") as string,
                inline: true,
              },
              {
                name: "Viewers",
                value: stream.viewer_count.toLocaleString(),
                inline: true,
              }
            )
            .setImage(
              stream.thumbnail_url
                .replace("{width}", "1280")
                .replace("{height}", "720")
            )
            .setTimestamp(),
        ],
        content: `@everyone`,
        components: [row],
      })
      .catch((err) => {
        console.log(err);
      });
  }

  private connectTwitch() {
    const twitch = new Twitch({
      channels: ["tenz"],
      liveChannels: [],
      interval: 1000,
      client: {
        id: config.client.id,
        secret: config.client.secret,
        token: config.client.token,
      },
    });

    this.twitch = twitch;

    twitch.on("live", (stream) => {
      this.announceLive(stream);
    });
  }
}
