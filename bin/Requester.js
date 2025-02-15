"use strict";
/*! @license MIT ©2016 Ruben Verborgh, Ghent University - imec */
/* Single-function HTTP(S) request module */
/* Translated from https://github.com/LinkedDataFragments/Client.js/blob/master/lib/util/Request.js */
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const url = require("url");
const zlib = require("zlib");
const sizeof = require('object-sizeof')
const http = require("follow-redirects").http; // tslint:disable-line no-var-requires
const https = require("follow-redirects").https; // tslint:disable-line no-var-requires
// Decode encoded streams with these decoders
const DECODERS = { gzip: zlib.createGunzip, deflate: zlib.createInflate };
var global_statistics = {
  calls: 0,
  bytes: 0
}
class Requester {
    constructor(agentOptions) {
        this.agents = {
            http: new http.Agent(agentOptions || {}),
            https: new https.Agent(agentOptions || {}),
        };
    }

    // Creates an HTTP request with the given settings
    createRequest(settings) {
        // Parse the request URL
        if (settings.url) {
            Object.assign(settings, url.parse(settings.url));
        }
        // Emit the response through a proxy
        let request;
        const requestProxy = new events_1.EventEmitter();
        const requester = settings.protocol === 'http:' ? http : https;
        settings.agents = this.agents;
        request = requester.request(settings, (response) => {
            response = this.decode(response);
            response.setEncoding('utf8');
            // this was removed compared to the original LDF client implementation
            response.pause(); // exit flow mode
            response.on('data', d => {
              global_statistics.bytes += sizeof(d)
            })
            requestProxy.emit('response', response);
        });
        request.on('error', (error) => requestProxy.emit('error', error));
        request.end();
        return requestProxy;
    }
    // Returns a decompressed stream from the HTTP response
    decode(response) {
      global_statistics.calls++
        const encoding = response.headers['content-encoding'];
        if (encoding) {
            if (encoding in DECODERS) {
                // Decode the stream
                const decoded = DECODERS[encoding]();
                response.pipe(decoded);
                // Copy response properties
                decoded.statusCode = response.statusCode;
                decoded.headers = response.headers;
                return decoded;
            }
            // Error when no suitable decoder found
            setImmediate(() => {
                response.emit('error', new Error('Unsupported encoding: ' + encoding));
            });
        }
        
        return response;
    }
}
exports.default = Requester;
exports.getStats = () => global_statistics