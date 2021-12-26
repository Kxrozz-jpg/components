"use strict";
const EventEmitter = require("node:events");
const { Collection } = require("@discordjs/collection");
const Util = require("../Utils/Util");

/**
 * Filtro aplicado en el colector
 * @typedef {Function} CollectorFilter
 * @param {...*} args Algun argumento recibido por el listener
 * @pram {Collection} collection El item recolectado por esta colección
 * @returns {boolean|Promise<boolean>}
 */

/**
 * Opciones a aplicar al el colector
 * @typedef {Object} CollectorOptions
 * @property {CollectionFilter} [filter] El filtro aplicado a este colector
 * @property {number} [time] Cuánto tiempo ejecutar el recopilador en milisegundos
 * @property {number} [idle] Cuánto tiempo para detener el colector después de inactividad en milisegundos
 * @property {boolean} [dispose=flase] Ya sea para deshacerse de los datos cuando se eliminan
 */

/**
 * Clase abstracta para definir un nuevo colector.
 * @abstract
 */
class Collector extends EventEmitter {
  constructor(client, options = {}) {
    super();

    /**
     * El cliente que instancia este colector
     * @name Collector#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, "client", { value: client });

    /**
     * El filtro aplicado a este colector
     * @type {CollectorFilter}
     * @returns {boolean|Promise<boolean>}
     */
    this.filter = options.filter ?? (() => true);

    /**
     * Las opciones de este colector
     * @type {CollectorOptions}
     */
    this.options = options;

    /**
     * Los items recolectados por este collector
     * @type {Collection}
     */
    this.collected = new Collection();

    /**
     * Si este collector ha terminado de coleccionar
     * @type {boolean}
     */
    this.ended = false;

    /**
     * Tiempo de espera para limpiar
     * @type {?Timeout}
     * @private
     */
    this._timeout = null;

    /**
     * Tiempo de espera para limpieza debido a inactividad
     * @type {?Timeout}
     * @private
     */
    this._idletimeout = null;

    if (typeof this.filter !== "function") {
      throw new TypeError("INVALID_TYPE, options.filter");
    }

    this.handleCollect = this.handleCollect.bind(this);
    this.handleDispose = this.handleDispose.bind(this);

    if (options.time)
      this._timeout = setTimeout(() => this.stop("time"), options.time);
    if (options.idle)
      this._idletimeout = setTimeout(() => this.stop("idle"), options.idle);
  }

  async handleCollect(...args) {
    const collect = await this.collect(...args);

    if (collect && (await this.filter(...args, this.collected))) {
      this.collected.set(collect, args[0]);

      /**
       * Emite cuando un elemento es recolectado
       */
      this.emit("collect", ...args);

      if (this._idletimeout) {
        clearTimeout(this._idletimeout);
        this._idletimeout = setTimeout(
          () => this.stop("idle"),
          this.options.idle
        ).unref();
      }
    }
    this.checkEnd();
  }

  /**
   * Llame a esto para eliminar un elemento de la colección. Acepta cualquier dato de evento como parámetro.
   * @param  {...any} args  El argumento emitido por el listener
   * @returns {Promise<void>}
   * @emits Collector#dispose
   */
  async handleDispose(...args) {
    if (!this.options.dispose) return;

    const dispose = this.dispose(...args);
    if (
      !dispose ||
      !(await this.filter(...args)) ||
      this.collected.has(dispose)
    )
      return;
    this.collected.delete(dispose);

    /**
     * Se emite cada vez que se elimina un elemento.
     * @event Collector#dispose
     * @param {...*} args El argumento emitido por el listener
     */
    this.emit("dispose", ...args);
    this.checkEnd();
  }

  /**
   * Devuelve una promesa que se resuelve con el siguiente elemento recopilado;
   * rechaza con elementos recolectados si el recolector termina sin recibir un elemento siguiente
   * @type {Promise}
   * @readonly
   */
  get next() {
    return new Promise((resolve, reject) => {
      if (this.ended) {
        reject(this.collected);
        return;
      }

      const cleanup = () => {
        this.removeListener("collect", onCollect);
        this.removeListener("end", onEnd);
      };
      const onCollect = (item) => {
        cleanup();
        resolve(item);
      };

      const onEnd = () => {
        cleanup();
        reject(this.collected);
      };

      this.on("collect", onCollect);
      this.on("end", onEnd);
    });
  }

  stop(reason = "user") {
    if (this.ended) return;

    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    if (this._idletimeout) {
      clearTimeout(this._idletimeout);
      this._idletimeout = null;
    }
    this.ended = null;

    /**
     * Se emite cuando el collector finaliza la recolección
     * @event Collector#end
     * @param {Collection} collected Los elementos recogidos por el collecor
     * @param {string} reason La razón por la que terminó el collector
     */
    this.emit("end", this.collected, reason);
  }

  /**
   * Opciones utilizadas para restablecer el tiempo de espera y el temporizador de inactividad de un {@link Collector}.
   * @typedef {Object} CollectorResetTimerOptions
   * @property {number} [time] Cuánto tiempo se ejecutará el recopilador (en milisegundos)
   * @property {number} [idle] Cuánto tiempo esperar para detener el recolector después de inactividad (en milisegundos)
   */

  /**
   * Restablece el tiempo de espera del recopilador y el temporizador de inactividad.
   * @param {CollectorResetTimerOptions} [options] Opciones para restablecer
   */
  resetTimer({ time, idle } = {}) {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(
        () => this.stop("time"),
        time ?? this.options.time
      ).unref();
    }
    if (this._idletimeout) {
      clearTimeout(this._idletimeout);
      this._idletimeout = setTimeout(
        () => this.stop("idle"),
        idle ?? this.options.idle
      ).unref();
    }
  }

  /**
   * Comprueba si el recolector debe finalizar y, en caso afirmativo, lo finaliza.
   * @returns {boolean} Si el recolector terminó o no
   */
  checkEnd() {
    const reason = this.endReason;
    if (reason) this.stop(reason);
    return Boolean(reason);
  }

  /**
   * Permite que los recolectorres se consuman con bucles de espera
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
   */
  async *[Symbol.asyncIterator]() {
    const queue = [];
    const onCollect = (item) => queue.push(item);
    this.on("collect", onCollect);

    try {
      while (queue.length || !this.ended) {
        if (queue.length) {
          yield queue.shift();
        } else {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => {
            const tick = () => {
              this.removeListener("collect", tick);
              this.removeListener("end", tick);
              return resolve();
            };
            this.on("collect", tick);
            this.on("end", tick);
          });
        }
      }
    } finally {
      this.removeListener("collect", onCollect);
    }
  }

  toJSON() {
    return Util.flatten(this);
  }

  /**
   * TLa razón por la que este colector ha terminado con, o nulo si aún no ha terminado
   * @type {?string}
   * @readonly
   * @abstract
   */
  get endReason() {}

  /**
   * Maneja eventos entrantes de la función `handleCollect`. Devuelve nulo si el evento no debería
   * recopilarse, o devuelve un objeto que describe los datos que deben almacenarse.
   * @see Collector#handleCollect
   * @param {...*} args Cualquier argumento que el oyente de eventos emita
   * @returns {?(*|Promise<?*>)} Datos para insertar en la colección, si corresponde
   * @abstract
   */
  collect() {}

  /**
   * Maneja los eventos entrantes del `handleDispose`. Devuelve nulo si el evento no debería
   * ser desechado, o devuelve la llave que debe ser removida.
   * @see Collector#handleDispose
   * @param {...*} args Cualquier argumento que el oyente de eventos emita
   * @returns {?*} Clave para eliminar de la colección, si la hubiera
   * @abstract
   */
  dispose() {}
}

module.exports = Collector;
