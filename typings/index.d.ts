import {
  Client,
  User,
  Message,
  Interaction,
  TextChannel,
  GuildChannel,
  Guild
} from "eris";
import { CollectorFilter, CollectorOptions } from "../src/Structures/Collector";
export { Collection } from "@discordjs/collection";
import { EventEmitter } from "node:events";
import { MessageComponentTypes, InteractionTypes } from "./enum";

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

export class InteractionCollector<T extends Interaction> extends Collector<
  string,
  T
> {
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
