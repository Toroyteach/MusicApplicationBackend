import { Module } from "@nestjs/common";
import { CacheModule } from '@nestjs/cache-manager';
import { OnlineGateway } from "./gateway";
import { UserSessionCache } from "./user-session-cache";

@Module({
    imports: [CacheModule.register({
        isGlobal: true
      })],
    providers: [OnlineGateway, UserSessionCache],
})
export class GatewayModule { }