import { JsonConverter } from '@library/json/json-converter';
import { RequestOptions as HttpRequestOptions, OutgoingHttpHeaders, request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { WebResponse } from './web-response';

type QueryDictionary = { [key: string]: { toString(): string } };

export class WebRequest {
    private url: URL;
    private bodyType?: string;
    private body?: string;
    private auth?: string;

    public constructor(baseUrl: string) {
        this.url = new URL(baseUrl);
    }

    public static create(baseUrl: string): WebRequest {
        return new WebRequest(baseUrl);
    }

    public withProtocol(protocol: string): WebRequest {
        this.url.protocol = protocol;
        return this;
    }

    public withPort(port: number): WebRequest {
        this.url.port = port.toString();
        return this;
    }

    public withPath(...paths: string[]): WebRequest {
        const path = paths
            .map((path) => (path.startsWith('/') ? path.substring(1) : path))
            .map((path) => (path.endsWith('/') ? path.substring(0, -2) : path))
            .join('/');

        this.url.pathname = path;
        return this;
    }

    private queriefy<T extends QueryDictionary>(data: T): string {
        return Object.keys(data)
            .map((key) => `${key}=${data[key].toString()}`)
            .join('&');
    }

    public withQuery(params: QueryDictionary): WebRequest {
        for (const key in params) {
            const value = params[key].toString();
            this.url.searchParams.set(key, value);
        }

        return this;
    }

    public withForm<T extends QueryDictionary>(
        data: T,
        type: string = 'application/x-www-form-urlencoded'
    ): WebRequest {
        this.body = this.queriefy(data);
        this.bodyType = type;
        return this;
    }

    public withBody<T extends object>(data: T, type: string = 'application/json'): WebRequest {
        this.body = JsonConverter.stringify(data);
        this.bodyType = type;
        return this;
    }

    public withAuth(prefix: string, value: string): WebRequest {
        this.auth = `${prefix} ${value}`;
        return this;
    }

    public withBasicAuth(username?: string, password?: string): WebRequest {
        if (!username || !password) throw 'Invalid credentials!';
        const buffer = Buffer.from(`${username}:${password}`, 'utf-8');
        return this.withAuth('Basic', buffer.toString('base64'));
    }

    public withBearerAuth(jwtToken: string): WebRequest {
        return this.withAuth('Bearer', jwtToken);
    }

    private get request() {
        switch (this.url.protocol) {
            case 'https':
            case 'https:':
                return httpsRequest;
            case 'http':
            case 'http:':
                return httpRequest;
            default:
                throw 'This protocol is not supported!';
        }
    }

    private get options() {
        const headers: OutgoingHttpHeaders = {};
        if (this.auth) headers['Authorization'] = this.auth;
        if (this.body) {
            headers['Content-Type'] = this.bodyType;
            headers['Content-Length'] = Buffer.byteLength(this.body, 'utf-8');
        }

        const options: HttpRequestOptions = {
            headers,
            host: this.url.host,
            port: this.url.port,
            path: this.url.pathname + this.url.search,
            protocol: this.url.protocol,
        };

        return options;
    }

    public execute(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'): Promise<WebResponse> {
        return new Promise((resolve, reject) => {
            const options = this.options;
            options.method = method;

            const request = this.request(options);
            request.on('response', (response) => {
                const chunks: Buffer[] = [];
                response.on('error', (error) => reject(error));
                response.on('data', (chunk: Buffer) => {
                    if (typeof response.statusCode === 'undefined') {
                        reject(chunks);
                        return;
                    }

                    chunks.push(chunk);
                });
                response.on('end', () => {
                    if (typeof response.statusCode === 'undefined') {
                        reject(chunks);
                        return;
                    }

                    const data = Buffer.concat(chunks);
                    resolve(new WebResponse(response.statusCode, data));
                });
            });

            if (this.body) {
                request.write(this.body);
            }

            request.end();
        });
    }
}
