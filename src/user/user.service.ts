import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { AuthTokenContent } from "../auth/types/token-types";
import { ConfigService } from "../config/config.service";
import { InjectRepository } from "../decorators/inject-repository.decorator";
import {
  BadRequestException,
  UnauthorizedException,
} from "../helpers/error-type";
import { Company } from "./company.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserLoginDto } from "./dto/user-login.dto";
import { User } from "./user.entity";

@injectable()
export class UserService {
  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(ConfigService) private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Company) private companyRepository: Repository<Company>
  ) {}

  async getSelf(token: string) {
    let tokenData;
    try {
      tokenData = this.authService.validate(token) as AuthTokenContent;
    } catch (error) {
      throw new BadRequestException("Provided token is invalid");
    }

    const user = await this.userRepository.findOneBy({
      id: tokenData.user_id as number,
    });

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      email_address: createUserDto.email_address,
    });

    if (existingUser) {
      throw new BadRequestException();
    }

    let company = await this.companyRepository.findOneBy({
      name: createUserDto.company,
    });

    if (!company) {
      company = await this.companyRepository.save({
        name: createUserDto.company,
      });
    }

    const hashedPassword = await this.authService.hash(createUserDto.password);

    const savedUser = await this.userRepository.save({
      email_address: createUserDto.email_address,
      password: hashedPassword,
      company_id: company.id,
    });

    const { password, ...rest } = savedUser;

    return rest;
  }

  async refresh(token: string, request: Request, response: Response) {
    let tokenData;

    try {
      tokenData = this.authService.validate(token);
    } catch (error) {
      response.clearCookie("access_token");
      response.clearCookie("refresh_token");
      throw new BadRequestException("Provided refresh token is invalid");
    }

    if (!tokenData.refresh) {
      response.clearCookie("access_token");
      response.clearCookie("refresh_token");
      throw new BadRequestException("Provided refresh token is invalid");
    }

    const user = await this.userRepository.findOneBy({
      id: tokenData.user_id as number,
    });

    if (!user) {
      response.clearCookie("access_token");
      response.clearCookie("refresh_token");
      throw new BadRequestException("Provided refresh token is invalid");
    }

    const secure = this.configService.get("NODE_ENV") === "production";
    const newToken = await this.authService.generate(
      {
        user_id: user.id,
        user_email: user.email_address,
        company_id: user.company_id,
      },
      { expiresIn: "15m" }
    );

    request.cookies["access_token"] = newToken;

    response.cookie("access_token", newToken, {
      httpOnly: true,
      secure,
    });

    return {
      user,
    };
  }

  async login(userLoginDto: UserLoginDto, response: Response) {
    const { email_address, password } = userLoginDto;

    const user = await this.userRepository
      .createQueryBuilder()
      .where({ email_address })
      .addSelect("User.password")
      .getOne();

    if (!user) {
      response.clearCookie("access_token");
      response.clearCookie("refresh_token");
      throw new UnauthorizedException();
    }

    const compare = await this.authService.compare(password, user.password);

    if (!compare) {
      response.clearCookie("access_token");
      response.clearCookie("refresh_token");
      throw new UnauthorizedException();
    }

    const { password: hashedPassword, ...userProps } = user;

    const userWithoutPassword: Omit<User, "password"> = Object.assign(
      {},
      userProps
    );

    const secure = this.configService.get("NODE_ENV") === "production";

    response.cookie(
      "access_token",
      await this.authService.generate(
        {
          user_id: user.id,
          user_email: user.email_address,
          company_id: user.company_id,
        },
        { expiresIn: "15m" }
      ),
      {
        httpOnly: true,
        secure,
      }
    );

    response.cookie(
      "refresh_token",
      await this.authService.generate({ user_id: user.id, refresh: true }),
      {
        httpOnly: true,
        secure,
      }
    );

    return userWithoutPassword;
  }
}
