import {
  Client,
  User,
  Message,
  Interaction,
  TextChannel,
  GuildChannel,
  Guild,
  ComponentInteraction,
} from "eris";
import { CollectorFilter, CollectorOptions } from "../src/Structures/Collector";
export { Collection } from "@discordjs/collection";
import { EventEmitter } from "node:events";
import {
  MessageComponentTypes,
  InteractionTypes,
  MessageButtonStyles,
} from "./enum";

export interface CollectorResetTimerOptions {
  time?: number;
  idle?: number;
}

export interface CollectorOptions<T extends unknown[]> {
  filter?: CollectorFilter<T>;
  time?: number;
  idle?: number;
  dispose?: boolean;
}

export type CollectorFilter<T extends unknown[]> = (
  ...args: T
) => boolean | Promise<boolean>;

export type Awaitable<T> = T | PromiseLike<T>;

export abstract class Collector<
  K,
  V,
  F extends unknown[] = []
> extends EventEmitter {
  protected constructor(client: Client, options?: CollectorOptions);
  private _timeout: NodeJS.Timeout | null;
  private _idletimeout: NodeJS.Timeout | null;

  public readonly client: Client;
  public collected: Collection<K, V>;
  public ended: boolean;
  public abstract readonly endReason: string | null;
  public filter: CollectorFilter<[V, ...F]>;
  public readonly next: Promise<V>;
  public options: CollectorOptions<[V, ...F]>;
  public checkEnd(): boolean;
  public handleCollect(...args: unknown[]): Promise<void>;
  public handleDispose(...args: unknown[]): Promise<void>;
  public stop(reason?: string): void;
  public resetTimer(options?: CollectorResetTimerOptions);
  public [Symbol.asyncIterator](): AsyncIterableIterator<V>;
  public toJSON(): unknown;

  protected listener: (...args: any[]) => void;
  public abstract collect(...args: unknown[]): K | null | Promise<K | null>;
  public abstract dispose(...args: unknown[]): K | null;

  public on(
    event: "collect" | "dispose",
    listener: (...args: [V, ...F]) => Awaitable<void>
  ): this;
  public on(
    event: "end",
    listener: (collected: Collection<K, V>, reason?: string) => Awaitable<void>
  ): this;
}

export type MessageComponentType = keyof typeof MessageComponentTypes;

export type InteractionType = keyof typeof InteractionTypes;

export interface InteractionCollectorOptions<T extends Interaction>
  extends CollectorOptions<[T]> {
  channel?: TextChannel;
  componentType?: MessageComponentType | MessageComponentTypes;
  guild?: Guild;
  interactionType?: InteractionType | InteractionTypes;
  max?: number;
  maxComponents?: number;
  maxUsers?: number;
  message?: Message;
}

export default class InteractionCollector<
  T extends Interaction
> extends Collector<string, T> {
  public constructor(client: Client, options?: InteractionCollectorOptions<T>);
  private _handleMessageDeletion(message: Message): void;
  private _handleChannelDeletion(channel: GuildChannel): void;
  private _handleGuildDeletion(guild: Guild): void;

  public channelId: string | null;
  public componentType: MessageComponentType | null;
  public readonly endReason: string | null;
  public guildId: string | null;
  public interactionType: InteractionType | null;
  public messageId: string | null;
  public options: InteractionCollectorOptions<T>;
  public total: number;
  public users: Collection<string, User>;

  public collect(interaction: Interaction): string;
  public empty(): void;
  public dispose(interaction: Interaction): string;
  public on(
    event: "collect" | "dispose",
    listener: (interaction: T) => Awaitable<void>
  ): this;
  public on(
    event: "end",
    listener: (
      collected: Collection<string, T>,
      reason: string
    ) => Awaitable<void>
  ): this;
  public on(event: string, listener: (...args: any[]) => Awaitable<void>): this;

  public once(
    event: "collect" | "dispose",
    listener: (interaction: T) => Awaitable<void>
  ): this;
  public once(
    event: "end",
    listener: (
      collected: Collection<string, T>,
      reason: string
    ) => Awaitable<void>
  ): this;
  public once(
    event: string,
    listener: (...args: any[]) => Awaitable<void>
  ): this;
}

export interface RichEmbedAuthor {
  name: string;
  url?: string;
  iconURL?: string;
  proxyIconURL?: string;
}

export interface RichEmbedFooter {
  text: string;
  iconURL?: string;
  proxyIconURL?: string;
}

export interface RichEmbedImage {
  url: string;
  proxyURL?: string;
  height?: number;
  width?: number;
}

export interface RichEmbedThumbnail {
  url: string;
  proxyURL?: string;
  height?: number;
  width?: number;
}

export interface RichEmbedOptions {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: Date | number;
  color?: ColorResolvable;
  fields?: EmbedFieldData[];
  author?: Partial<RichEmbedAuthor> & {
    icon_url?: string;
    proxy_icon_url?: string;
  };
  thumbnail?: Partial<RichEmbedThumbnail> & { proxy_url?: string };
  image?: Partial<RichEmbedImage> & { proxy_url?: string };
  footer?: Partial<RichEmbedFooter> & {
    icon_url?: string;
    proxy_icon_url?: string;
  };
}

export interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

export interface EmbedFieldData {
  name: string;
  value: string;
  inline?: boolean;
}

export class RichEmbed {
  private _fieldEquals(field: EmbedField, other: EmbedField): boolean;

  public constructor(data?: RichEmbed | RichEmbedOptions);
  public author: RichEmbedAuthor | null;
  public color: number | null;
  public readonly createdAt: Date | null;
  public description: string | null;
  public fields: EmbedField[];
  public footer: RichEmbedFooter | null;
  public readonly hexColor: HexColorString | null;
  public image: RichEmbedImage | null;
  public readonly length: number;
  public thumbnail: RichEmbedThumbnail | null;
  public timestamp: number | null;
  public title: string | null;
  /** @deprecated */
  public type: string;
  public url: string | null;
  public addField(name: string, value: string, inline?: boolean): this;
  public addFields(...fields: EmbedFieldData[] | EmbedFieldData[][]): this;
  public setFields(...fields: EmbedFieldData[] | EmbedFieldData[][]): this;
  public setAuthor(name: string, iconURL?: string, url?: string): this;
  public setColor(color: ColorResolvable): this;
  public setDescription(description: string): this;
  public setFooter(text: string, iconURL?: string): this;
  public setImage(url: string): this;
  public setThumbnail(url: string): this;
  public setTimestamp(timestamp?: Date | number | null): this;
  public setTitle(title: string): this;
  public setURL(url: string): this;
  public spliceFields(
    index: number,
    deleteCount: number,
    ...fields: EmbedFieldData[] | EmbedFieldData[][]
  ): this;
  public equals(embed: RichEmbed): boolean;
  public toJSON(): APIEmbed;

  public static normalizeField(
    name: string,
    value: string,
    inline?: boolean
  ): Required<EmbedFieldData>;
  public static normalizeFields(
    ...fields: EmbedFieldData[] | EmbedFieldData[][]
  ): Required<EmbedFieldData>[];
}

export class MessageButtton {
  public constructor(data?: MessageButton);
  public customId: string | null;
  public disabled: boolean;
  public emoji: string | null;
  public label: string | null;
  public style: MessageButtonStyle | null;
  public type: 2;
  public url: string | null;
  public setCustomId(customId: string): this;
  public setDisabled(disabled?: boolean): this;
  public setEmoji(emoji: string): this;
  public setLabel(label: string): this;
  public setStyle(style: MessageButtonStyleResolvable): this;
  public setURL(url: string): this;
  public toJSON(): APIComponent;
  private static resolveStyle(
    style: MessageButtonStyleResolvable
  ): MessageButtonStyle;
}

export type MessageButtonStyle = keyof typeof MessageButtonStyles;
export type MessageButtonStyleResolvable =
  | MessageButtonStyle
  | MessageButtonStyles;
