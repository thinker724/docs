# nest 中文文档阅读笔记

## 中文文档

[Nestjs 中文文档](http://nestjs.inode.club/)

## 安装

```bash
npm i -g @nestjs/cli
$ nest new project-name
```

## 核心基础知识

### 程序入口

使用 `@nestjs/core` 提供的一个类：`NestFactory`，其中暴露出了一些静态方法，`create` 就是其中一个，执行返回一个`INestApplication` 应用程序对象。

```ts
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

注意事项：

```ts
// 程序在启动的过程中发现错误，会直接终止程序；不想要终止程序，而是报错，需如下写法：
NestFactory.create(AppModule, { abortOnError: false });
```

Nest 默认支持两个 HTTP 平台：`express` 和 `fastify`。每个平台都会暴露自己的对应接口：`NestExpressApplication` 和 `NestFastifyApplication`。

```ts
// 指定 express 平台
const app = await NestFactory.create<NestExpressApplication>(AppModule);
// 指定 fastify 平台
const app = await NestFactory.create<NestFastifyApplication>(AppModule);
```

但是请注意，除非你确实想访问底层平台的 API，否则不需要指定类型。

### 控制器（Controller）

作用：处理接口请求和接口返回数据。

**官方概念**：

- 存在*多*个控制器
- 一个控制器存在*多*个路由（从上到下依次匹配）
- *路由机制*控制哪个控制器接收哪些请求。
- *路由路径*是*可选的控制器（controller）路径前缀*和*请求方法装饰器（get,post）中声明的任何路径字符串*的组合字符串

_响应处理_：

- 标准（推荐）：数组和对象转化为 JSON，针对基本数据类型，直接返回，不做处理。
- 特定库：如 express。则需要手动注入 `@Res` 等装饰器

_状态码_：

处理 Post 请求之外，都是 200，Post 是 201，可以通过 `HttpCode` 来指定

```ts
import { Controller, Post, HttpCode } from "@nestjs/common";

@Controller("/cats")
export default class CatsController {
  @Post()
  @HttpCode(200)
  findAll(): string[] {
    return ["cats"];
  }
}
```

_请求对象_：

处理程序通常需要访问客户端的请求详细信息。Nest 提供了对底层平台的请求对象（默认为 Express）的访问。

- `@Req()` 或者 `@Request()` 来获取所有信息
- `@Query()` `@Params()` `@Ip()` `@Body()` `@Next()` 来获取对应的部分信息。

> 针对 Req 或者 Request 需要安装类型：`@types/express`

```ts
import { Controller, Get, Post, HttpCode, Req, Query } from "@nestjs/common";
import { Request } from "express";

@Controller("/cats")
export default class CatsController {
  @Get()
  @HttpCode(200)
  findAll(@Req() res: Request, @Query() query: string): string[] {
    // res 请求对象  query：query 对象
    return ["cats"];
  }
}
```

_头部信息：_

自定义的响应头，你可以使用`@Header()`装饰器，或则特定库`res.header()`

```ts
@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new cat';
}
```

_重定向_：

可以使用`@Redirect()`装饰器，也可以使用特定库`res.redirect()`

```ts
@Controller("/cats")
export default class CatsController {
  @Get("create")
  create(): { name: string } {
    return { name: "thinker1" };
  }

  @Get()
  @Redirect("http://localhost:3000/cats/create", 301) // 重定向到另外一个接口
  findAll(@Req() res: Request, @Query() query: string): string[] {
    console.log("res, query======>", res, query);
    return ["cats"];
  }
}
```

_异步性：_

每个异步函数都必须返回一个 Promise。这意味着你可以返回一个延迟的值，Nest 将能够自行解析它

```ts
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

_请求负载_

通过 `DTO`（数据传输对象）来定义了数据将如何通过网络发送的对象。推荐使用*类*来定义 DTO。（ES6 class 会保留实体，而 interface 在编译过程中，会被删除，nest 在运行时无法使用。在某些情景下，运行时会存现错误的可能，保留实体比较重要）。

```ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

### 提供者（Services）

作用：抽离 controller 层的复杂逻辑。通过使用 `@Injectable()` 装饰器来定义。

由 `@Injectable()` 申明的类会被 nest IOC 容器进行管理。

::: tip 注意点
搞清楚什么时候使用 DTO，什么时候使用 interface。

DTO 简单的来说，就是对用户传递过来的数据进行验证，所以说，针对 @Body()，就会使用 DTO；而针对返回值，类的参数等，都是使用 interface。
:::

_基本使用_

:::code-group

```ts [catService.ts]
import { Injectable } from "@nestjs/common";

export interface Cats {
  name: string;
}

@Injectable()
class CatsService {
  private readonly cats: Cats[] = [];
  add(cat: Cats) {
    this.cats.push(cat);
  }
  findAll() {
    return this.cats;
  }
}

export default CatsService;
```

```ts [dto/cat.dto]
export class CatDto {
  name: string;
}
```

```ts [catController.ts]
import { Controller, Get, Post, Body } from "@nestjs/common";
import CatsService, { Cats } from "./cats.service";
import { CatDto } from "./dto/cat.dto";

@Controller("/cats")
export default class CatsController {
  constructor(private catService: CatsService) {}
  @Post("create")
  create(@Body() cat: CatDto) {
    return this.catService.add(cat);
  }

  @Get("find")
  async findAll(): Promise<Cats[]> {
    return this.catService.findAll();
  }
}
```

```ts [catModule.ts]
import { Module } from "@nestjs/common";
import CatsController from "./cats.controller";
import CatsService from "./cats.service";

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

:::

注意事项：

- 什么时候使用 interface，什么时候使用 dto
- dto 和 interface 如何定义
- 创建了 service 之后，需要在 module 中声明一下，不然使用会报错
- 在 controller 中使用 service, **注意初始化的特殊写法**：CatsService 是通过类构造函数注入的。请注意使用了 private 语法。这种简写允许我们在**同一位置立即声明和初始化 catsService 成员**。

### 模块（Module）

模块是带有`@Module()`装饰器的类。`@Module()`装饰器提供元数据，供 nest 组织程序结构。

**注意事项：**

- 每个应用程序必须有一个模块，即**根模块**。应用程序图的构建起点。
- `@Module()` 接受一个对象作为参数，其结构（provides, controllers, imports, exports）。前面两个， nest 内部会自动的进行实例化。imports 导入其他的模块，构建程序图

<hr />

_特性模块_：

就类似于一个业务模块，包含业务的 controller 和 services。

```ts
// cat.module.ts
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

<hr />

_共享模块_：

nest 中，模块是单例的，因此可以在其他模块中共享 Services 实例（业务模块提供者）。

```ts
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsCervice], // 需要导出 Service，供其他模块使用
})
export class CatsModule {}
```

- 其他模块要使用`CatsService`, 就需要导出 `CatsService`（使用 `exports` 进行导出）。
- 其他模块导入整个模块`CatsModule`之后，就可以使用 `CatsService` 了，并且共享同一个实例对象（下面可以体现出来）。

<hr />

_其他模块使用 Service_：

::: code-group

```ts [dogs.module.ts]
import { Module } from "@nestjs/common";
import DogsController from "./dogs.controller";
import DogsService from "./dogs.service";
import { CatsModule } from "src/cats/cats.module";

@Module({
  controllers: [DogsController],
  providers: [DogsService],
  imports: [CatsModule], // 使用其他模块的 Service，需要注册 modules
})
export class DogsModule {}
```

```ts [dogs.controller.ts]
import { Controller, Get, Post, Body } from "@nestjs/common";
import CatsService, { Cats } from "src/cats/cats.service";
import { DogDto } from "./dto/dog.dto";

@Controller("/dogs")
export default class CatsController {
  constructor(private catsService: CatsService) {}
  @Post("create")
  create(@Body() cat: DogDto) {
    return this.catsService.add(cat);
  }

  @Get("find")
  async findAll(): Promise<Cats[]> {
    return this.catsService.findAll();
  }
}
```

:::

- 使用`其他 Service`, 需要导入`其他 module`
- 使用`其他 Service`, 是共享同一个实例对象
- controller 中使用多个 Service, 就只需要在类的构造函数多传递几个参数

```ts
@Controller("/dogs")
export default class CatsController {
  constructor(
    private catsService: CatsService,
    private dogsService: DogsService
  ) {}
}
```

::: warning 注意事项
这种写法不一定正确，还在学习中
:::

<hr />

_模块的重新导出_：

`DogsModule`模块导入 `CatsModule` 模块，又可以导出`CatsModule`模块。那么当其他模块导入 `DogsModule`时，同时可以使用 DogsModule 暴露出来的 Service，又可以使用 CatsModule 暴露出来的 Service。

```ts
//dogs.module.ts
@Module({
  imports: [CatsModule],
  exports: [CatsModule],
})
export class DogsModule {}
```

<hr />

_全局模块_

```ts
// cats.module.ts
@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

使用 `@Global` 来注册全局模块，那么在其他模块中，使用 `CatsService` 就不需要导入 `CatsModule` 了，直接使用即可。

> 针对核心业务模块，不建议所有模块都使用全局的

### 中间件（Middleware）

- Middleware 是在路由处理程序之前调用的函数。
- Nest 中间件默认情况下与 express 中间件等效。

<hr />

_编写中间件_

1. 类的形式：需要带有`@Injectable()`装饰器的类，并且实现 `NestMiddleware` 接口。
2. 函数形式：没有特别要求，跟 express 基本一致。

:::code-group

```ts [类形式中间件]
// 打印中间件
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // use 方法
  use(req: Request, res: Response, next: NextFunction) {
    console.log("Request...");
    next(); // 也是必须调用 nest, 才能继续向下走
  }
}
```

```ts [函数形式中间件]
import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}
```

:::

::: tip 使用建议
当中间件不需要任何依赖时，可以考虑使用更简单的**函数式中间件**替代方案
:::

<hr />

_应用中间件_

上面编写中间件之后，就要应用在项目中。但是在 `@Module` 中没有模块的位置，需要使用模块类（实现 `NestModule` 的类）的`configure()`来实现它。

```ts
// cats.module.ts
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

// 中间件
import { LoggerMiddleware } from "../middleware/logger";

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
// 需要实现 NestModule 类
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用中间件给 ['cats'] 路径
    consumer.apply(LoggerMiddleware).forRoutes("cats");
    // 针对路径的某个方法 [cats / get]
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
  }
}
```
