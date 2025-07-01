import { 
  Client, 
  GatewayIntentBits, 
  Message, 
  SlashCommandBuilder,
  REST,
  Routes
} from 'discord.js';
import { DiceService } from './DiceService.js';
import { MessageFormatter } from '../utils/MessageFormatter.js';
import { Logger } from '../utils/Logger.js';
import { Config } from '../utils/Config.js';
import { COMMAND_PREFIX, COMMAND_PREFIX_ZENKAKU } from '../types/Command.js';

/**
 * ダブルクロス専用Discordボット
 */
export class Bot {
  private client: Client;
  private isReady = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.setupEventHandlers();
  }

  /**
   * イベントハンドラーを設定
   */
  private setupEventHandlers(): void {
    this.client.once('ready', async () => {
      await this.onReady();
    });

    this.client.on('messageCreate', async (message: Message) => {
      await this.onMessageCreate(message);
    });

    this.client.on('interactionCreate', async (interaction) => {
      await this.onInteractionCreate(interaction);
    });

    this.client.on('error', (error) => {
      Logger.error('Discord client error', error);
    });
  }

  /**
   * Ready イベントハンドラー
   */
  private async onReady(): Promise<void> {
    try {
      Logger.info(`Bot logged in as ${this.client.user?.tag}`);
      
      // DiceServiceを初期化
      await DiceService.initialize();
      
      // スラッシュコマンドを登録
      await this.registerSlashCommands();
      
      this.isReady = true;
      Logger.info('Bot is ready!');
    } catch (error) {
      Logger.error('Failed to initialize bot', error as Error);
    }
  }

  /**
   * ボットを開始
   */
  public async start(): Promise<void> {
    try {
      Logger.info('Starting Discord bot...');
      await this.client.login(Config.DISCORD_TOKEN);
    } catch (error) {
      Logger.error('Failed to start bot', error as Error);
      throw error;
    }
  }

  /**
   * ダイスコマンドかどうかを判定
   */
  private isDiceCommand(content: string): boolean {
    return content.startsWith(COMMAND_PREFIX) || content.startsWith(COMMAND_PREFIX_ZENKAKU);
  }

  /**
   * メッセージ作成イベントハンドラー
   */
  private async onMessageCreate(message: Message): Promise<void> {
    // ボット自身のメッセージは無視
    if (message.author.bot) return;

    // ダイスコマンド（プレフィックス形式）を処理
    if (this.isDiceCommand(message.content)) {
      await this.handleDiceCommand(message);
    }
  }

  /**
   * ダイスコマンドを処理
   */
  private async handleDiceCommand(message: Message): Promise<void> {
    try {
      const diceCommand = DiceService.parseDiceCommand(message.content);
      const result = await DiceService.rollDice(diceCommand);
      const embed = MessageFormatter.formatDiceResult(result, message.author.username);
      
      await message.reply({ embeds: [embed] });
    } catch (error) {
      Logger.error('Failed to handle dice command', error as Error);
      
      const embed = MessageFormatter.formatErrorMessage(
        'ダイスコマンドの処理中にエラーが発生しました。',
        'コマンド形式を確認してください。例: `!dx 8DX+5`'
      );
      
      await message.reply({ embeds: [embed] });
    }
  }

  /**
   * インタラクション作成イベントハンドラー
   */
  private async onInteractionCreate(interaction: any): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    try {
      switch (interaction.commandName) {
        case 'dxhelp':
          await this.handleHelpCommand(interaction);
          break;
        case 'dxinfo':
          await this.handleInfoCommand(interaction);
          break;
        default:
          break;
      }
    } catch (error) {
      Logger.error('Failed to handle interaction', error as Error);
    }
  }

  /**
   * ヘルプコマンドを処理
   */
  private async handleHelpCommand(interaction: any): Promise<void> {
    const embed = MessageFormatter.formatHelpMessage();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /**
   * 情報コマンドを処理
   */
  private async handleInfoCommand(interaction: any): Promise<void> {
    const embed = MessageFormatter.formatInfoMessage();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /**
   * スラッシュコマンドを登録
   */
  private async registerSlashCommands(): Promise<void> {
    try {
      const commands = [
        new SlashCommandBuilder()
          .setName('dxhelp')
          .setDescription('ダブルクロスBotのヘルプを表示します'),
        
        new SlashCommandBuilder()
          .setName('dxinfo')
          .setDescription('ダブルクロスBotの情報を表示します')
      ].map(command => command.toJSON());

      const rest = new REST({ version: '10' }).setToken(Config.DISCORD_TOKEN);

      Logger.info('Started refreshing application (/) commands.');

      if (Config.GUILD_ID) {
        // 開発環境：特定のギルドにのみ登録
        await rest.put(
          Routes.applicationGuildCommands(Config.CLIENT_ID, Config.GUILD_ID),
          { body: commands }
        );
        Logger.info('Successfully reloaded guild application (/) commands.');
      } else {
        // 本番環境：グローバルに登録
        await rest.put(
          Routes.applicationCommands(Config.CLIENT_ID),
          { body: commands }
        );
        Logger.info('Successfully reloaded global application (/) commands.');
      }
    } catch (error) {
      Logger.error('Failed to register slash commands', error as Error);
    }
  }

  /**
   * ボットを停止
   */
  public async stop(): Promise<void> {
    try {
      Logger.info('Stopping Discord bot...');
      await this.client.destroy();
      this.isReady = false;
    } catch (error) {
      Logger.error('Failed to stop bot', error as Error);
      throw error;
    }
  }

  /**
   * ボットの準備状態を取得
   */
  public get ready(): boolean {
    return this.isReady;
  }
} 