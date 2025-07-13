/**
 * @typedef {Object} MaskLine
 * @property {number[][]} points
 * @property {number} strokeWidth
 */

/**
 * @typedef {Object} Mask
 * @property {string} id
 * @property {MaskLine[]} lines
 */

/**
 * @typedef {Object} BaseShape
 * @property {string} id
 * @property {string} tool
 * @property {string} color
 * @property {number} strokeWidth
 * @property {number} opacity
 * @property {Mask=} mask
 */

/**
 * @typedef {BaseShape & { type: "line", points: number[][], isTemp?: boolean }} LineShape
 * @typedef {BaseShape & { type: "rect", start: number[], end: number[], strokeColor: string }} RectShape
 * @typedef {BaseShape & { type: "circle", center: number[], radius: number, strokeColor: string }} CircleShape
 * @typedef {BaseShape & { type: "text", point: number[], text: string, strokeColor: string }} TextShape
 * @typedef {LineShape | RectShape | CircleShape | TextShape} CanvasElement
 */

/**
 * @type {Object.<string, CanvasElement[]>}
 */
const canvasState = {};

module.exports = canvasState;
