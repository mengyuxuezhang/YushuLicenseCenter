# 羽枢授权中心 · YushuLicenseCenter

独立部署的代理授权与运营平台。与[羽枢管理后台 YushuHub](https://github.com/mengyuxuezhang/YushuHub)通过版本化HTTP协议集成；管理代理授权、功能套餐、部署绑定、管理员账号及审计，不处理模型内容、支付扣款或代理供货钱包。

本仓库公开源码，沿用源项目的[现有许可证](LICENSE)和[商业授权说明](COMMERCIAL_LICENSE.md)，公开不等于无条件商业使用。当前为拆分开发版本，未发布正式生产更新。

接手请读[验证与迁移状态](docs/STATUS.md)，跨项目导航在[project-hub](https://github.com/mengyuxuezhang/project-hub)。

## 功能

- 一次性激活码、Ed25519签名、绑定、续期、停用、撤销、迁移和累计额度。
- 单层独立代理；自定义与固定服务商模式分别授权，无二级代理。
- 套餐编辑保存同步关联授权；删除使用中套餐受保护，用量不清零。
- 唯一主管理员、普通管理员、本人改密、主管理员重置他人密码；旧会话失效及中文审计。
- 默认密码与TOTP登录；测试可显式使用图片验证码；Webhook到期提醒。
- 独立Vue运营入口，风格与YushuHub一致。

## 开发与验证

Node.js 22.12+，独立MySQL8数据库。

```sh
npm ci
npm ci --prefix web-admin
npm run check
npm run web:typecheck
npm run web:test
npm run web:architecture
npm run web:build
```

内存适配器验证授权生命周期、权限、并发与密码；不需要真实模型供应商或经营数据库。构建产物`web/license-center`随源码提交。`web-admin`只包含授权中心前端及沿用的公共样式，不包含经营后台。

## 安装

复制`.env.example`到仓库外受控文件并填写。创建独立数据库及最小权限用户，不复用代理经营库。使用`AI_LICENSE_BOOTSTRAP_PASSWORD`设置至少16位初始密码，再运行：

```sh
node scripts/authorization-init.mjs /secure/license-material operator
node --env-file=/secure/license.env cloud/license-center/server.mjs --migrate
node --env-file=/secure/license.env cloud/license-center/server.mjs
```

初始化材料包含私钥、公钥集合、签名编号、凭据派生密钥及运营账号TOTP。仅在受控环境保存并备份，不提交Git。默认回环地址17881，通过HTTPS代理公开`/license-center/`及`/api/license-center/v1`。所有环境变量见`.env.example`；不在浏览器设置或传递数据库、私钥。

首次启动将运营账号文件初始化到中心库：第一个账号为唯一主管理员。后续密码和新增管理员以数据库为准，重启不回写文件旧密码。主管理员通过“账号管理”创建管理员和重置他人密码；所有管理员通过“修改密码”输入原密码修改自己。创建/重置密码须12至128位并含字母数字，保存后目标旧会话失效。新增账号的备用TOTP密钥仅显示一次，恢复动态验证前需绑定验证器。测试`AI_LICENSE_OPERATOR_LOGIN_MODE=captcha`，正式默认`totp`。

## 协议与源码边界

[接口协议](docs/PROTOCOL.md)。YushuHub只维护代理侧接入及官方业务鉴权，签发和运营模块由本仓库维护。`protocol.mjs`与参考`deployment-client.mjs`为兼容性测试保留；代理运行实现仍以YushuHub为准，修改协议需双向回归。公开能力目录在`capability-catalog.mjs`，键名与YushuHub能力保持一致，不依赖其环境配置。

完整源码与服务器由代理控制时，无法保证本地许可判断不可被改写；拆仓只隔离维护和交付职责。自建中心没有官方签名私钥，不会获得官方中心认可的授权。官方构建、更新与保护资源须在官方服务器向可信中心核验，New API独立控制自己的余额。私钥和凭据永不公开；过去同仓库的代码历史不会因拆分而变为秘密。

## 来源与迁移

从YushuHub `feat/license-center-direct-newapi`的`2379645116de05275ecf62604999f0aebc75b68c`提取授权中心相关文件，保留10个相关提交的过滤历史，过滤后提交ID不同；原仓库完整历史保留。随后移除运行时对管理端配置的依赖并建立独立依赖、测试与构建入口。不得把过滤历史中的早期快照视为当时已经独立可部署的版本。

已有中心迁移仅更换代码目录和启动入口，沿用数据库、签名材料、凭据派生密钥、运营账号资料、环境文件及Webhook；不要重新初始化或覆盖数据库。迁移前备份代码和受控数据，核对授权、套餐、管理员及审计；回退代码时也不覆盖新增数据。管理端与中心分别发布，本仓库公开或提交不等于生产部署。
