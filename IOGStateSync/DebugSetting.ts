export const debug:boolean = true;

/**
 *开启Debug模式时,同步数据到客户端,否则不同步
 *
 * @export
 * @param {*} target
 * @param {*} key
 */
export function debugsync(target, key) {
    if (debug === false) {
        Object.defineProperty(target, key, {
            get: function () { return undefined; },
            set: function (val) {
                Object.defineProperty(this, key, {
                    value: val,
                    writable: true,
                    enumerable: false,
                    configurable: true,
                });
            },
            enumerable: false,
        });
    }
}