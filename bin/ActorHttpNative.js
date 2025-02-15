"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bus_http_1 = require("@comunica/bus-http");
require("isomorphic-fetch");
const Requester_1 = require("./Requester");
/**
 * A comunica Follow Redirects Http Actor.
 */
class ActorHttpNative extends bus_http_1.ActorHttp {
    constructor(args) {
        super(args);
        this.userAgent = ActorHttpNative.createUserAgent();
        this.requester = new Requester_1.default(args.agentOptions ? JSON.parse(args.agentOptions) : undefined);
    }

    static get stats() {
      return Requester_1.getStats()
    }

    static createUserAgent() {
        return `Comunica/actor-http-native (${typeof window === 'undefined'
            ? 'Node.js ' + process.version + '; ' + process.platform : 'Browser-' + window.navigator.userAgent})`;
    }
    async test(action) {
        // TODO: check for unsupported fetch features
        return { time: Infinity };
    }
    async run(action) {
        const options = {};
        // input can be a Request object or a string
        // if it is a Request object it can contain the same settings as the init object
        if (action.input.url) {
            options.url = action.input.url;
            Object.assign(options, action.input);
        }
        else {
            options.url = action.input;
        }
        if (action.init) {
            Object.assign(options, action.init);
        }
        if (options.headers) {
            const headers = {};
            options.headers.forEach((val, key) => {
                headers[key] = val;
            });
            options.headers = headers;
        }
        else {
            options.headers = {};
        }
        if (!options.headers['user-agent']) {
            options.headers['user-agent'] = this.userAgent;
        }
        options.method = options.method || 'GET';
        this.logInfo(action.context, `Requesting ${options.url}`);
        // not all options are supported
        return new Promise((resolve, reject) => {
            const req = this.requester.createRequest(options);
            req.on('error', reject);
            req.on('response', (httpResponse) => {
                httpResponse.on('error', (e) => {
                    httpResponse = null;
                    reject(e);
                });
                // Avoid memory leak on HEAD requests
                if (options.method === 'HEAD') {
                    httpResponse.destroy();
                }
                // using setImmediate so error can be caught should it be thrown
                setImmediate(() => {
                    if (httpResponse) {
                        // Expose fetch cancel promise
                        httpResponse.cancel = () => Promise.resolve(httpResponse.destroy());
                        // missing several of the required fetch fields
                        const headers = new Headers(httpResponse.headers);
                        const result = {
                            body: httpResponse,
                            headers,
                            ok: httpResponse.statusCode < 300,
                            redirected: options.url !== httpResponse.responseUrl,
                            status: httpResponse.statusCode,
                            // when the content came from another resource because of conneg, let Content-Location deliver the url
                            url: headers.has('content-location') ? headers.get('content-location') : httpResponse.responseUrl,
                        };
                        resolve(result);
                    }
                });
            });
        });
    }
}
exports.ActorHttpNative = ActorHttpNative;