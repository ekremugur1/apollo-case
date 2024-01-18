import { Request, Response } from "express";
import { inject } from "tsyringe";
import { Auth } from "../decorators/auth.decorator";
import { Body } from "../decorators/body.decorator";
import { Controller } from "../decorators/controller.decorator";
import { Cookie } from "../decorators/cookie.decorator";
import { Get } from "../decorators/get.decorator";
import { Post } from "../decorators/post.decorator";
import { Req } from "../decorators/req.decorator";
import { Res } from "../decorators/res.decorator";
import { JwtStrategy } from "../strategies/auth/jwt.strategy";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(@inject(UserService) private userService: UserService) {}

  @Post("login")
  async login(@Body() userLoginDto: UserLoginDto, @Res() response: Response) {
    return this.userService.login(userLoginDto, response);
  }

  @Get("logout")
  logout(@Res() response: Response) {
    response.clearCookie("access_token");
    response.clearCookie("refresh_token");

    return "success";
  }

  @Get("refresh")
  async refresh(
    @Cookie("refresh_token") token: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    return await this.userService.refresh(token, request, response);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Auth(JwtStrategy)
  @Get("self")
  async getSelf(@Cookie("access_token") token: string) {
    return await this.userService.getSelf(token);
  }
}
