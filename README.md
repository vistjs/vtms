视觉测试管理系统，使用 Puppeteer 自动进行 Web 网页访问并进行截图对比，截图对比会产生报告，通过报告 Web 开发人员可以及时的发现 Web UI 的异常。

## 功能

- 项目管理 
<img width="1268" alt="image" src="https://user-images.githubusercontent.com/4689952/203388061-c3ee9b74-7ee5-45e4-9fb8-1dbaf01b9561.png">

- 用例管理 
<img width="1275" alt="image" src="https://user-images.githubusercontent.com/4689952/203388517-e1785870-317b-4838-b2a6-3688dda51896.png">

通过目录，可以将不同业务的用例归到一起。

用例可以配置任务运行接口通知 hook，可以结合具备 webhooks 即时通信软件使用。

<img width="1276" alt="image" src="https://user-images.githubusercontent.com/4689952/203388809-e98e75c6-04c4-48c2-802b-f730afbbade3.png">

- 任务管理 
<img width="1272" alt="image" src="https://user-images.githubusercontent.com/4689952/203389156-8223bc0c-f868-4486-ad24-f4174674dad0.png"> 
点击`详情`可以跳转到具体的报告页
点击`覆盖master`会将此分支的截图作为比对的基线截图

- 报告页 
<img width="1275" alt="image" src="https://user-images.githubusercontent.com/4689952/203389697-ac2f749d-1ea6-4817-9262-6e07eb2ef91b.png"> 
可以对 failed 的截图进行 approve 操作，failed 的状态会变成 pass

## 目录

- frontend 前端
- server 后端

## 开发

1. 安装依赖

```bash
pnpm install
```

2. 安装 Mongodb、Puppeteer docker 镜像首先确保本地安装了 docker，然后

```bash
docker-compose -f stack.yml up
```

3. 在前后端各自的目录 frontend、server 启动

```bash
pnpm run dev
```

## 生产部署

1. 建议将 Mongodb、Puppeteer 安装到不同的容器中
2. 在前后端各自的目录 frontend、server 打包

```bash
pnpm run build
```

3. 在后端目录，启动后端服务

```bash
pnpm run start
```

4. 将 web 服务代理转发到后端服务端口 3000

## 与 CI/CD 结合

提供了一个用于外部运行任务的 openAPI, `http://localhost:3000/api/open/task?pid={pid}&commit={commit}&token={token}`, 接口定义请看[详情](https://github.com/vistjs/vtms/tree/main/server/pages/api/open/task.ts)。
