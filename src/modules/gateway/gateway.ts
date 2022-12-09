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

@WebSocketGateway({ cors: true })
export class OnlineGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(private userSessionCache: UserSessionCache) { }

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('OnlineGateway');

    @SubscribeMessage('onlineListeners')
    public async joinRoom(client: Socket, @MessageBody() data: UserOnline,) {
        this.logger.log("onlineListeners", data.userName);
        client.join('HouseRoom');


        let userData = {
            userName: data.userName,
            activeSong: data.activeSong,
            displayPicUrl: data.displayPicUrl
        } as UserOnline;

        this.userSessionCache.addOrUpdate(userData);

        const activeUsers = await this.userSessionCache.getAllActive();
        this.server.emit('patientList', activeUsers.map(x => x.userName));
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}