import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// These classes will be used to create a strategy for authenticating users using a JSON Web Token (JWT)
// The ExtractJwt class will be used to extract the JWT from the request
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  //constructor to set the options for the strategy
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  //validate method to validate the payload of the JWT
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
