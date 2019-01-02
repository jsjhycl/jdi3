/**
 * This Module Can use Node & Electron
 */
import injects from './services/injectRoute';
//#region 
// @ts-ignore
window.nodeRequire = require;
// @ts-ignore
delete window.require;
// @ts-ignore
delete window.exports;
// @ts-ignore
delete window.module;
//#endregion

// @ts-ignore
global.jdi=injects;
export {};
