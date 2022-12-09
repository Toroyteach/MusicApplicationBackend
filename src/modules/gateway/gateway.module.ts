import { CacheModule, Module } from "@nestjs/common";
import { OnlineGateway } from "./gateway";
import { UserSessionCache } from "./user-session-cache";

@Module({
    imports: [CacheModule.register({
        isGlobal: true
      })],
    providers: [OnlineGateway, UserSessionCache],
})
export class GatewayModule { }