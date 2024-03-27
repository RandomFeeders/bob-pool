export type ConnectionStringType = 'mysql';
type StringDictionary = { [key: string]: string };

export class ConnectionString {
    public type: ConnectionStringType = 'mysql';
    public username?: string;
    public password?: string;
    public host: string;
    public port: number;
    public database: string;
    public args?: StringDictionary;

    constructor(connectionString: string) {
        const connectionStringTypeBody = connectionString.split('://', 2);
        const type = connectionStringTypeBody[0];
        const body = connectionStringTypeBody[1];

        if (type !== this.type) throw new Error('Invalid mysql connection string');

        const connectionStringUserHost = body.split('@', 2);
        if (connectionStringUserHost.length == 2) {
            const userPass = connectionStringUserHost[0].split(':', 2);
            this.username = userPass[0];
            this.password = userPass[1];
        }

        const hostDb = connectionStringUserHost[connectionStringUserHost.length - 1].split('/', 2);
        const hostPort = hostDb[0].split(':', 2);
        this.host = hostPort[0];
        this.port = Number(hostPort[1] ?? 3306);
        const dbArgs = hostDb[1].split('?', 2);
        this.database = dbArgs[0];

        const args = dbArgs[1]?.split('&');
        if (args && args.length > 0) {
            this.args = args.reduce((pv, cv) => {
                const keyValue = cv.split('=', 2);
                pv[keyValue[0]] = keyValue[1];
                return pv;
            }, {} as StringDictionary);
        }
    }

    public toString(): string {
        const auth = this.username && this.password ? `${this.username}:${this.password}@` : '';
        const argsArray = this.args ? Object.keys(this.args).map((key) => `${key}=${this.args![key]}`) : [];
        const argsString = argsArray.length > 0 ? `?${argsArray.join('&')}` : '';
        return `${this.type}://${auth}${this.host}:${this.port}/${this.database}${argsString}`;
    }
}
