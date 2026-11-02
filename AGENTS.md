# 授权中心开发约定

- 先读README与docs/PROTOCOL.md。此仓库只维护独立授权中心；代理经营后台和客户端接入在YushuHub，桌面端源码不进入本仓库。
- 中文文档及提交说明，沿用LICENSE，不自行更改授权条款。
- 业务逻辑在src/services/authorization，入口只负责装配；单层代理，不恢复二级、供货钱包或模型网关。
- 私钥、运营资料、环境值和数据库不入Git；测试只使用虚构主体、生成密钥和模拟数据。
- 后端运行npm run check；前端运行web:typecheck、web:test、web:architecture、web:build，提交构建产物。
- 协议或能力键变更同步YushuHub集成回归。源码交付不能承诺本地校验不可修改，官方服务须独立核验可信中心。
- 保留数据库与密钥身份，部署和发布分别按用户授权执行，不以发布源码代替生产切换。
