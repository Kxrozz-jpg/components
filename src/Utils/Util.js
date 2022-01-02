const { Colors } = require("./Constants");

class Util extends null {
  /**
   * Flatten an object. Any properties that are collections will get converted to an array of keys.
   * @param {Object} obj The object to flatten.
   * @param {...Object<string, boolean|string>} [props] Specific properties to include/exclude.
   * @returns {Object}
   */
  static flatten(obj, ...props) {
    if (!isObject(obj)) return obj;

    const objProps = Object.keys(obj)
      .filter((k) => !k.startsWith("_"))
      .map((k) => ({ [k]: true }));

    props = objProps.length
      ? Object.assign(...objProps, ...props)
      : Object.assign({}, ...props);

    const out = {};

    for (let [prop, newProp] of Object.entries(props)) {
      if (!newProp) continue;
      newProp = newProp === true ? prop : newProp;

      const element = obj[prop];
      const elemIsObj = isObject(element);
      const valueOf =
        elemIsObj && typeof element.valueOf === "function"
          ? element.valueOf()
          : null;

      // If it's a Collection, make the array of keys
      if (element instanceof Collection)
        out[newProp] = Array.from(element.keys());
      // If the valueOf is a Collection, use its array of keys
      else if (valueOf instanceof Collection)
        out[newProp] = Array.from(valueOf.keys());
      // If it's an array, flatten each element
      else if (Array.isArray(element))
        out[newProp] = element.map((e) => Util.flatten(e));
      // If it's an object with a primitive `valueOf`, use that value
      else if (typeof valueOf !== "object") out[newProp] = valueOf;
      // If it's a primitive
      else if (!elemIsObj) out[newProp] = element;
    }

    return out;
  }

  /**
   * Resuelve un color que se puede resolver en un número de color.
   * @param {ColorResolvable} color Color a resolver
   * @returns {number} Un color
   */
  static resolveColor(color) {
    if (typeof color === "string") {
      if (color === "RANDOM") return Math.floor(Math.random() * (0xffffff + 1));
      if (color === "DEFAULT") return 0;
      color = Colors[color] ?? parseInt(color.replace("#", ""), 16);
    } else if (Array.isArray(color)) {
      color = (color[0] << 16) + (color[1] << 8) + color[2];
    }

    if (color < 0 || color > 0xffffff) throw new RangeError("COLOR_RANGE");
    if (Number.isNaN(color)) throw new TypeError("COLOR_CONVERT");

    return color;
  }

  /**
   * Superficial: copia un objeto con su clase / prototipo intacto.
   * @param {Object} obj Objecto a clonar
   * @returns {Object}
   * @private
   */
  static cloneObject(obj) {
    return Object.assign(Object.create(obj), obj);
  }
  /**
   * Verifies the provided data is a string, otherwise throws provided error.
   * @param {string} data The string resolvable to resolve
   * @param {Function} [error] The Error constructor to instantiate. Defaults to Error
   * @param {string} [errorMessage] The error message to throw with. Defaults to "Expected string, got <data> instead."
   * @param {boolean} [allowEmpty=true] Whether an empty string should be allowed
   * @returns {string}
   */
  static verifyString(
    data,
    error = Error,
    errorMessage = `Se esperaba un string, tienes ${data} en lugar de.`,
    allowEmpty = true
  ) {
    if (typeof data !== "string") throw new error(errorMessage);
    if (!allowEmpty && data.length === 0) throw new error(errorMessage);
    return data;
  }

  /**
   * Resolves a partial emoji object from an {@link EmojiIdentifierResolvable}, without checking a Client.
   * @param {EmojiIdentifierResolvable} emoji Emoji identifier to resolve
   * @returns {?RawEmoji}
   * @private
   */
  static resolvePartialEmoji(emoji) {
    if (!emoji) return null;
    if (typeof emoji === "string")
      return /^\d{17,19}$/.test(emoji) ? { id: emoji } : Util.parseEmoji(emoji);
    const { id, name, animated } = emoji;
    if (!id && !name) return null;
    return { id, name, animated: Boolean(animated) };
  }
}

module.exports = Util;
