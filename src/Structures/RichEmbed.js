"use strict";

const Util = require("../Utils/Util");

class RichEmbed {
  constructor(data = {}, skip = false) {
    this.setup(data, skip);
  }

  setup(data, skip) {
    /**
     * El tipo de embed
     * @type {string}
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-types}
     */
    this.type = data.type ?? "rich";

    /**
     * El titulo del embed
     * @type {?string}
     */
    this.title = data.title ?? null;

    /**
     * La descriptición del embed
     * @type {?string}
     */
    this.description = data.description ?? null;

    /**
     * La URL del embed
     * @type {?string}
     */
    this.url = data.url ?? null;

    /**
     * El color del embed
     * @type {?number}
     */
    this.color = "color" in data ? Util.resolveColor(data.color) : null;

    /**
     * El timestamp del embed
     * @type {?number}
     */
    this.timestamp =
      "timestamp" in data ? new Date(data.timestamp).getTime() : null;

    /**
     * Los fields de este embed
     */
    this.fields = [];
    if (data.fields) {
      this.fields = skip
        ? data.fields.map(Util.cloneObject)
        : this.constructor.normalizeFields(data.fields);
    }

    /**
     * Representa la miniatura de un RichEmbed
     * @typedef {Object} RichEmbedThumbnail
     * @property {string} url URL para esta miniatura
     * @property {string} proxyURL ProxyURL de esta miniatura
     * @property {number} height Altura de esta miniatura
     * @property {number} width Ancho de esta miniatura
     */

    /**
     * La miniatura de este embed
     * @type {?RichEmbedThumbnail}
     */
    this.thumbnail = data.thumbnail
      ? {
          url: data.thumbnail.url,
          proxyURL: data.thumbnail.proxyURL ?? data.thumbnail.proxy_url,
          height: data.thumbnail.height,
          width: data.thumbnail.width,
        }
      : null;

    /**
     * Representa la imagen de un RichEmbed
     * @typedef {Object} RichEmbedImage
     * @property {string} url URL para esta imagen
     * @property {string} proxyURL ProxyURL de esta imagen
     * @property {number} height Altura de esta imagen
     * @property {number} width Ancho de esta imagen
     */

    /**
     * La imagén de este embed
     * @type {?RichEmbedImage}
     */
    this.image = data.image
      ? {
          url: data.image.url,
          proxyURL: data.image.proxyURL ?? data.image.proxy_url,
          height: data.image.height,
          width: data.image.width,
        }
      : null;

    /**
     * Representa la autor de un RichEmbed
     * @typedef {Object} RichEmbedAuthor
     * @property {string} name El nombre de este autor
     * @property {string} url URL de este autor
     * @property {string} iconURL URL del icono de este autor
     * @property {string} proxyIconURL Proxy URL del icono del autor
     */

    /**
     * El autor de este embed
     * @type {?RichEmbedAuthor}
     */
    this.author = data.author
      ? {
          name: data.author.name,
          url: data.author.url,
          iconURL: data.author.iconURL ?? data.author.icon_url,
          proxyIconURL: data.author.proxyIconURL ?? data.author.proxy_icon_url,
        }
      : null;

    /**
     * Representa el footer de un RichEmbed
     * @typedef {Object} MessageEmbedFooter
     * @property {string} text El texto del foooter
     * @property {string} iconURL URL del icono de este footer
     * @property {string} proxyIconURL Proxy URL del icono de este footer
     */

    /**
     * El footer de este embed
     * @type {?MessageEmbedFooter}
     */
    this.footer = data.footer
      ? {
          text: data.footer.text,
          iconURL: data.footer.iconURL ?? data.footer.icon_url,
          proxyIconURL: data.footer.proxyIconURL ?? data.footer.proxy_icon_url,
        }
      : null;
  }

  /**
   * La fecha mostrada en este embed
   * @type {?Date}
   * @readonly
   */
  get createAt() {
    return this.timestamp ? new Date(this.timestamp) : null;
  }

  /**
   * La versión hexadecimal del color del embed, con un hash inicial
   * @type {?string}
   * @readonly
   */
  get hexColor() {
    return this.color ? `#${this.color.toString(16).padStart(6, "0")}` : null;
  }

  /**
   * La longitud acumulada para el título, la descripción, los campos, el texto del pie de página y el nombre del autor insertados
   * @type {number}
   * @readonly
   */
  get length() {
    return (
      (this.title?.length ?? 0) +
      (this.description?.length ?? 0) +
      (this.fields.length >= 1
        ? this.fields.reduce(
            (prev, curr) => prev + curr.name.length + curr.value.length,
            0
          )
        : 0) +
      (this.footer?.text.length ?? 0) +
      (this.author?.name.length ?? 0)
    );
  }

  /**
   * Verifica si el este embed if igual a otro comparado por todas las propiedades por si solas
   * @param {RichEmbed} embed El comprado con el actual
   * @returns {boolean}
   */
  equals(embed) {
    return (
      this.type === embed.type &&
      this.author?.name === embed.author?.name &&
      this.author?.url === embed.author?.url &&
      this.author?.iconURL ===
        (embed.author?.iconURL ?? embed.author?.icon_url) &&
      this.color === embed.color &&
      this.title === embed.title &&
      this.description === embed.description &&
      this.url === embed.url &&
      this.timestamp === embed.timestamp &&
      this.fields.length === embed.fields.length &&
      this.fields.every((field, i) =>
        this._fieldEquals(field, embed.fields[i])
      ) &&
      this.footer?.text === embed.footer?.text &&
      this.footer?.iconURL ===
        (embed.footer?.iconURL ?? embed.footer?.icon_url) &&
      this.image?.url === embed.image?.url &&
      this.thumbnail?.url === embed.thumbnail?.url
    );
  }

  /**
   * Compara dos fields para ver si son iguales
   * @param {EmbedFieldData} field
   * @param {EmbedFieldData} other
   * @returns {boolean}
   * @private
   */
  _fieldEquals(field, other) {
    return (
      field.name === other.name &&
      field.value === other.value &&
      field.inline === other.inline
    );
  }

  /**
   * Añade un field a el embed (maximo 25)
   * @property {string} name El nombre de este field
   * @property {string} value  El valor de este field
   * @property {boolean} [inline=false] Si este campo se mostrará en línea
   * @returns {RichEmbed}
   */
  addField(name, value, inline) {
    return this.addFields({ name, value, inline });
  }

  /**
   * Añade fields a el embed (maximo 25)
   * @param {...EmbedFieldData|EmbedFieldData[]} fields El fields a añadir
   * @returns {RichEmbed}
   */
  addFields(...fields) {
    this.fields.push(...this.constructor.normalizeFields(...fields));
    return this;
  }

  /**
   * Establece el autor de este embed
   * @param {string} name El nombre del autor de este embed
   * @param {string} [iconURL] El icono URL del autor de este embed
   * @param {string} [url] La URL del auto de este embed
   * @returns {RichEmbed}
   */
  setAuthor(name, iconURL, url) {
    this.author = {
      name: Util.verifyString(name, RangeError, "EMBED_AUTHOR_NAME"),
      iconURL,
      url,
    };
    return this;
  }

  /**
   * Establece el color de este embed
   * @param {ColorResolvable} color El color del este embed
   * @returns {RichEmbed}
   */
  setColor(color) {
    this.color = Util.resolveColor(color);
    return this;
  }

  /**
   * Establece el descripción de este embed
   * @param {string} description La descripción
   * @returns {RichEmbed}
   */
  setDescription(description) {
    this.description = Util.verifyString(
      description,
      RangeError,
      "EMBED_DESCRIPTION"
    );
    return this;
  }

  /**
   * Establece el footer de este embed
   * @param {string} text El texto del footer
   * @param {string} [iconURL] El icono URL del footer
   * @returns {RichEmbed}
   */
  setFooter(text, iconURL) {
    this.footer = {
      text: Util.verifyString(text, RangeError, "EMBED_FOOTER_TEXT"),
      iconURL,
    };
    return this;
  }

  /**
   * Establece la image de este embed
   * @param {string} url La URL de la imagen
   * @returns {RichEmbed}
   */
  setImage(url) {
    this.image = { url };
    return this;
  }

  /**
   * Establece la miniatura de este embed
   * @param {string} url La URL de la minitura
   * @returns {RichEmbed}
   */
  setThumbnail(url) {
    this.thumbnail = { url };
    return this;
  }

  /**
   * Establece el timestamp de este embed.
   * @param {Date|number|null} [timestamp=Date.now()] El timestamp o la fecha.
   * Si es `null` entonces el timestamp no se establecerá (es decir, al editar un existente {@link MessageEmbed})
   * @returns {RichEmbed}
   */
  setTimestamp(timestamp = Date.now()) {
    if (timestamp instanceof Date) timestamp = timestamp.getTime();
    this.timestamp = timestamp;
    return this;
  }

  /**
   * Establece el titulo de este embed.
   * @param {string} title El title
   * @returns {RichEmbed}
   */
  setTitle(title) {
    this.title = Util.verifyString(title, RangeError, "EMBED_TITLE");
    return this;
  }

  /**
   * Establece la URL del embed
   * @param {string} url La URL
   * @returns {RichEmbed}
   */
  setURL(url) {
    this.url = url;
    return this;
  }

  /**
   * Transforma el embed a un objecto plano.
   * @returns {APIEmbed} Los datos raw de este embed
   */
  toJSON() {
    return {
      title: this.title,
      type: "rich",
      description: this.description,
      url: this.url,
      timestamp: this.timestamp && new Date(this.timestamp),
      color: this.color,
      fields: this.fields,
      thumbnail: this.thumbnail,
      image: this.image,
      author: this.author && {
        name: this.author.name,
        url: this.author.url,
        icon_url: this.author.iconURL,
      },
      footer: this.footer && {
        text: this.footer.text,
        icon_url: this.footer.iconURL,
      },
    };
  }

  /**
   * Normaliza la entrada de campo y vetifica strings.
   * @param {string} name El nombre del field
   * @param {string} value El valor del field
   * @param {boolean} [inline=false] Configurar el campo para que se muestre en línea
   * @returns {EmbedField}
   */
  static normalizeField(name, value, inline = false) {
    return {
      name: Util.verifyString(name, RangeError, "EMBED_FIELD_NAME", false),
      value: Util.verifyString(value, RangeError, "EMBED_FIELD_VALUE", false),
      inline,
    };
  }

  /**
   * @typedef {Object} EmbedFieldData
   * @property {string} name El nombre de este field
   * @property {string} value  El valor de este field
   * @property {boolean} [inline] Si este campo se mostrará en línea
   */

  /**
   * Normaliza la entrada de campo y resuelve strings.
   * @param {...EmbedFieldData|EmbedFieldData[]} fields Fields a normalizar
   * @returns {EmbedField[]}
   */
  static normalizeFields(...fields) {
    return fields
      .flat(2)
      .map((field) =>
        this.normalizeField(
          field.name,
          field.value,
          typeof field.inline === "boolean" ? field.inline : false
        )
      );
  }
}

module.exports = RichEmbed;
