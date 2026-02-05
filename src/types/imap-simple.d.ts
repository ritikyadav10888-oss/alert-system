declare module 'imap-simple' {
    export interface ImapSimpleOptions {
        imap: {
            user: string;
            password?: string;
            host: string;
            port: number;
            tls: boolean;
            authTimeout: number;
        }
    }

    export interface Message {
        parts: any[];
        attributes: {
            uid: number;
            [key: string]: any;
        }
    }

    export interface Connection {
        openBox(boxName: string): Promise<string>;
        search(searchCriteria: any[], fetchOptions: any): Promise<Message[]>;
        end(): void;
    }

    export function connect(options: ImapSimpleOptions): Promise<Connection>;
}
