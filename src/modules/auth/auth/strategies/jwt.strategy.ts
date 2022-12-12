import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from '@nestjs/config';
import { Config } from '..//../../../firebase/config.models';

export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private configService: ConfigService<Config>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: '7A125D673E2D5E29'
        })
    }

    async validate(payload: any) {
        return {userId: payload.sub, username: payload.username}
    }
}