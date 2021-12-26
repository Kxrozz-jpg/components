exports.Colors = {
  DEFAULT: 0x000000,
  WHITE: 0xffffff,
  AQUA: 0x1abc9c,
  GREEN: 0x57f287,
  BLUE: 0x3498db,
  YELLOW: 0xfee75c,
  PURPLE: 0x9b59b6,
  LUMINOUS_VIVID_PINK: 0xe91e63,
  FUCHSIA: 0xeb459e,
  GOLD: 0xf1c40f,
  ORANGE: 0xe67e22,
  RED: 0xed4245,
  GREY: 0x95a5a6,
  NAVY: 0x34495e,
  DARK_AQUA: 0x11806a,
  DARK_GREEN: 0x1f8b4c,
  DARK_BLUE: 0x206694,
  DARK_PURPLE: 0x71368a,
  DARK_VIVID_PINK: 0xad1457,
  DARK_GOLD: 0xc27c0e,
  DARK_ORANGE: 0xa84300,
  DARK_RED: 0x992d22,
  DARK_GREY: 0x979c9f,
  DARKER_GREY: 0x7f8c8d,
  LIGHT_GREY: 0xbcc0c0,
  DARK_NAVY: 0x2c3e50,
  BLURPLE: 0x5865f2,
  GREYPLE: 0x99aab5,
  DARK_BUT_NOT_BLACK: 0x2c2f33,
  NOT_QUITE_BLACK: 0x23272a,
};

exports.Events = {
  RATE_LIMIT: "rateLimit",
  INVALID_REQUEST_WARNING: "invalidRequestWarning",
  API_RESPONSE: "apiResponse",
  API_REQUEST: "apiRequest",
  CLIENT_READY: "ready",
  APPLICATION_COMMAND_CREATE: "applicationCommandCreate",
  APPLICATION_COMMAND_DELETE: "applicationCommandDelete",
  APPLICATION_COMMAND_UPDATE: "applicationCommandUpdate",
  GUILD_CREATE: "guildCreate",
  GUILD_DELETE: "guildDelete",
  GUILD_UPDATE: "guildUpdate",
  GUILD_UNAVAILABLE: "guildUnavailable",
  GUILD_MEMBER_ADD: "guildMemberAdd",
  GUILD_MEMBER_REMOVE: "guildMemberRemove",
  GUILD_MEMBER_UPDATE: "guildMemberUpdate",
  GUILD_MEMBER_AVAILABLE: "guildMemberAvailable",
  GUILD_MEMBERS_CHUNK: "guildMembersChunk",
  GUILD_INTEGRATIONS_UPDATE: "guildIntegrationsUpdate",
  GUILD_ROLE_CREATE: "roleCreate",
  GUILD_ROLE_DELETE: "roleDelete",
  INVITE_CREATE: "inviteCreate",
  INVITE_DELETE: "inviteDelete",
  GUILD_ROLE_UPDATE: "roleUpdate",
  GUILD_EMOJI_CREATE: "emojiCreate",
  GUILD_EMOJI_DELETE: "emojiDelete",
  GUILD_EMOJI_UPDATE: "emojiUpdate",
  GUILD_BAN_ADD: "guildBanAdd",
  GUILD_BAN_REMOVE: "guildBanRemove",
  CHANNEL_CREATE: "channelCreate",
  CHANNEL_DELETE: "channelDelete",
  CHANNEL_UPDATE: "channelUpdate",
  CHANNEL_PINS_UPDATE: "channelPinsUpdate",
  MESSAGE_CREATE: "messageCreate",
  MESSAGE_DELETE: "messageDelete",
  MESSAGE_UPDATE: "messageUpdate",
  MESSAGE_BULK_DELETE: "messageDeleteBulk",
  MESSAGE_REACTION_ADD: "messageReactionAdd",
  MESSAGE_REACTION_REMOVE: "messageReactionRemove",
  MESSAGE_REACTION_REMOVE_ALL: "messageReactionRemoveAll",
  MESSAGE_REACTION_REMOVE_EMOJI: "messageReactionRemoveEmoji",
  THREAD_CREATE: "threadCreate",
  THREAD_DELETE: "threadDelete",
  THREAD_UPDATE: "threadUpdate",
  THREAD_LIST_SYNC: "threadListSync",
  THREAD_MEMBER_UPDATE: "threadMemberUpdate",
  THREAD_MEMBERS_UPDATE: "threadMembersUpdate",
  USER_UPDATE: "userUpdate",
  PRESENCE_UPDATE: "presenceUpdate",
  VOICE_SERVER_UPDATE: "voiceServerUpdate",
  VOICE_STATE_UPDATE: "voiceStateUpdate",
  TYPING_START: "typingStart",
  WEBHOOKS_UPDATE: "webhookUpdate",
  INTERACTION_CREATE: "interactionCreate",
  ERROR: "error",
  WARN: "warn",
  DEBUG: "debug",
  SHARD_DISCONNECT: "shardDisconnect",
  SHARD_ERROR: "shardError",
  SHARD_RECONNECTING: "shardReconnecting",
  SHARD_READY: "shardReady",
  SHARD_RESUME: "shardResume",
  INVALIDATED: "invalidated",
  RAW: "raw",
  STAGE_INSTANCE_CREATE: "stageInstanceCreate",
  STAGE_INSTANCE_UPDATE: "stageInstanceUpdate",
  STAGE_INSTANCE_DELETE: "stageInstanceDelete",
  GUILD_STICKER_CREATE: "stickerCreate",
  GUILD_STICKER_DELETE: "stickerDelete",
  GUILD_STICKER_UPDATE: "stickerUpdate",
};

/**
 * The type of an {@link Interaction} object:
 * * PING
 * * APPLICATION_COMMAND
 * * MESSAGE_COMPONENT
 * * APPLICATION_COMMAND_AUTOCOMPLETE
 * @typedef {string} InteractionType
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type}
 */
exports.InteractionTypes = createEnum([
  null,
  "PING",
  "APPLICATION_COMMAND",
  "MESSAGE_COMPONENT",
  "APPLICATION_COMMAND_AUTOCOMPLETE",
]);

/**
 * The type of a message component
 * * ACTION_ROW
 * * BUTTON
 * * SELECT_MENU
 * @typedef {string} MessageComponentType
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
 */
exports.MessageComponentTypes = createEnum([
  null,
  "ACTION_ROW",
  "BUTTON",
  "SELECT_MENU",
]);
