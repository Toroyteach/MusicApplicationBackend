import { Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    MessageBody
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserOnline } from './users.entity';
import { UserSessionCache } from './user-session-cache';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

@WebSocketGateway({ cors: true })
export class OnlineGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(private userSessionCache: UserSessionCache) { }

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('OnlineGateway');

    @SubscribeMessage('onlineListeners')
    public async joinRoom(client: Socket, @MessageBody() data: UserOnline) {
        this.logger.log("onlineListeners", data.userName);

        let userData = {
            userName: data.userName,
            activeSong: data.activeSong,
            displayPicUrl: data.displayPicUrl
        } as UserOnline;

        this.userSessionCache.addOrUpdate(userData).then(activeUsers => {
            this.server.emit('onlineUsersList', (activeUsers || []));
        });

    }

    @SubscribeMessage('unsubscribe')
    public async handleUnsubscribe(client: Socket, @MessageBody() data: UserOnline ) {
        this.logger.log(`User ${data.userName} is unsubscribing.`);

        const userName = data.userName;

        if (userName) {
            this.userSessionCache.remove(userName).then(activeUsers => {
                this.server.emit('onlineUsersList', (activeUsers || []));
            });
        }
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        const userName = client.data.userName;

        if (userName) {
            this.userSessionCache.remove(userName).then(activeUsers => {
                this.server.emit('onlineUsersList', (activeUsers || []));
            });
        }
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}