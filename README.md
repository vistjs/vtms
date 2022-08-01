# CodelessTC

test case manage system of rtweb.

# 技术栈

- [ant design pro](https://juejin.cn/post/6844904112534847501) -- 开箱即用的中台前端/设计解决方案
- [procomponents](https://procomponents.ant.design/components) -- 中后台高级组件库
- [nextjs](https://nextjs.org/docs) -- react server
- [mongoose](https://mongoosejs.com/docs/index.html)  -- ODM of mongodb
- typescript、eslint、prettier

> 我们使用ant design pro使用的是[umi max](https://umijs.org/docs/max/introduce)创建的， umi max打包好了一系列umi 插件，所以注意我们在使用umi的插件的时候，不要从umi导出包，
> 而是从@umijs/max 导出，比如你看文档可能会看到很多地方这样使用request库```import { request, useRequest } from 'umi';```, 那你要换成
> ```import { request, useRequest } from '@umijs/max';```


# 目录

- frontend 前端
- server  后端
# 开发
1. 安装依赖

```bash
pnpm install
```

2. 安装mongodb docker镜像
首先确保本地安装了docker，然后

```bash
docker-compose -f stack.yml up
```

3. 启动开发
可以在根目录启动，也可以在前后端各自的目录frontend、server启动

```bash
pnpm run dev
```