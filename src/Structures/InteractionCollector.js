"use strict";

const { Collection } = require("@discordjs/collection");
const Collector = require("./Collector");
const { Events, InteractionTypes, MessageComponentTypes } = require("../Utils/Constants");

/**
 * @typedef {CollectorOptions} InteractionCollectorOptions
 * @property {TextBasedChannels} [channel] Canal donde se escucha la interacción
 * @property {MessageComponentType} [componentType] El tipo de componente de la interacción
 * @property {Guild} [guild] El servidor se escucha la interacción
 * @property {InteractionType} [interactionType] El tipo de la interacción a recolectar
 * @property {number} [max] El maximo de interacciones a recolectar
 * @property {number} [maxComponents] El maximo de compontents a recolectar
 * @property {number} [maxUsers] El maximo de usuarios a recolectar
 * @property {Message} [message] El mensaje para escuchar las interacciones de
 */
class InteractionCollector extends Collector {
  /**
   *
   * @param {Client} client El cliente en el que recoger interacciones.
   * @param {InteractionCollectorOptions} [options={}] Las opciones para aplicar a este recopilador
   */
  constructor(client, options = {}) {
    super(client, options);

    /**
     * El mensaje del que recopilar interacciones, si se proporciona
     * @type {?string}
     */
    this.messageId = options.message?.id ?? null;

    this.channelId =
      this.client.getChannel(options.message?.channel) ??
      options.message?.channel_id;

    this.guildId =
      this.client.guilds.get(options.message?.guild) ??
      options.message?.guild_id;

    /**
     * The type of interaction to collect
     * @type {?InteractionType}
     */
    this.interactionType =
      typeof options.interactionType === "number"
        ? InteractionTypes[options.interactionType]
        : options.interactionType ?? null;

    /**
     * The type of component to collect
     * @type {?MessageComponentType}
     */
    this.componentType =
      typeof options.componentType === "number"
        ? MessageComponentTypes[options.componentType]
        : options.componentType ?? null;

    /**
     * The users that have interacted with this collector
     * @type {Collection<Snowflake, User>}
     */
    this.users = new Collection();

    /**
     * The total number of interactions collected
     * @type {number}
     */
    this.total = 0;

    this.empty = this.empty.bind(this);
    this.client.incrementMaxListeners();

    const bulkDeleteListener = (messages) => {
      if (messages.has(this.messageId)) this.stop("messageDelete");
    };

    if (this.messageId) {
      this._handleMessageDeletion = this._handleMessageDeletion.bind(this);
      this.client.on(Events.MESSAGE_DELETE, this._handleMessageDeletion);
      this.client.on(Events.MESSAGE_BULK_DELETE, bulkDeleteListener);
    }

    if (this.channelId) {
      this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
      this.client.on(Events.CHANNEL_DELETE, this._handleChannelDeletion);
    }

    if (this.guildId) {
      this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
      this.client.on(Events.GUILD_DELETE, this._handleGuildDeletion);
    }

    this.client.on(Events.INTERACTION_CREATE, this.handleCollect);

    this.once("end", () => {
      this.client.removeListener(Events.INTERACTION_CREATE, this.handleCollect);
      this.client.removeListener(
        Events.MESSAGE_DELETE,
        this._handleMessageDeletion
      );
      this.client.removeListener(
        Events.MESSAGE_BULK_DELETE,
        bulkDeleteListener
      );
      this.client.removeListener(
        Events.CHANNEL_DELETE,
        this._handleChannelDeletion
      );
      this.client.removeListener(
        Events.GUILD_DELETE,
        this._handleGuildDeletion
      );
      this.client.decrementMaxListeners();
    });

    this.on("collect", (interaction) => {
      this.total++;
      this.users.set(interaction.user.id, interaction.user);
    });
  }

  /**
   * Handles an incoming interaction for possible collection.
   * @param {Interaction} interaction The interaction to possibly collect
   * @returns {?Snowflake}
   * @private
   */
  collect(interaction) {
    /**
     * Emitted whenever an interaction is collected.
     * @event InteractionCollector#collect
     * @param {Interaction} interaction The interaction that was collected
     */
    if (this.interactionType && interaction.type !== this.interactionType)
      return null;
    if (this.componentType && interaction.componentType !== this.componentType)
      return null;
    if (this.messageId && interaction.message?.id !== this.messageId)
      return null;
    if (this.channelId && interaction.channelId !== this.channelId) return null;
    if (this.guildId && interaction.guildId !== this.guildId) return null;

    return interaction.id;
  }

  /**
   * Handles an interaction for possible disposal.
   * @param {Interaction} interaction The interaction that could be disposed of
   * @returns {?Snowflake}
   */
  dispose(interaction) {
    /**
     * Emitted whenever an interaction is disposed of.
     * @event InteractionCollector#dispose
     * @param {Interaction} interaction The interaction that was disposed of
     */
    if (this.type && interaction.type !== this.type) return null;
    if (this.componentType && interaction.componentType !== this.componentType)
      return null;
    if (this.messageId && interaction.message?.id !== this.messageId)
      return null;
    if (this.channelId && interaction.channelId !== this.channelId) return null;
    if (this.guildId && interaction.guildId !== this.guildId) return null;

    return interaction.id;
  }

  /**
   * Empties this interaction collector.
   */
  empty() {
    this.total = 0;
    this.collected.clear();
    this.users.clear();
    this.checkEnd();
  }

  /**
   * The reason this collector has ended with, or null if it hasn't ended yet
   * @type {?string}
   * @readonly
   */
  get endReason() {
    if (this.options.max && this.total >= this.options.max) return "limit";
    if (
      this.options.maxComponents &&
      this.collected.size >= this.options.maxComponents
    )
      return "componentLimit";
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers)
      return "userLimit";
    return null;
  }

  /**
   * Handles checking if the message has been deleted, and if so, stops the collector with the reason 'messageDelete'.
   * @private
   * @param {Message} message The message that was deleted
   * @returns {void}
   */
  _handleMessageDeletion(message) {
    if (message.id === this.messageId) {
      this.stop("messageDelete");
    }
  }

  /**
   * Handles checking if the channel has been deleted, and if so, stops the collector with the reason 'channelDelete'.
   * @private
   * @param {GuildChannel} channel The channel that was deleted
   * @returns {void}
   */
  _handleChannelDeletion(channel) {
    if (channel.id === this.channelId) {
      this.stop("channelDelete");
    }
  }

  /**
   * Handles checking if the guild has been deleted, and if so, stops the collector with the reason 'guildDelete'.
   * @private
   * @param {Guild} guild The guild that was deleted
   * @returns {void}
   */
  _handleGuildDeletion(guild) {
    if (guild.id === this.guildId) {
      this.stop("guildDelete");
    }
  }
}

module.exports = InteractionCollector;
