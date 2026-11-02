// Public capability identifiers shared with YushuHub.
export const CAPABILITY_GROUPS = [
  {
    "name": "专家市场",
    "permissions": [
      {
        "key": "curated_agents.view",
        "name": "查看精选专家",
        "description": "查看精选专家、依赖和分发状态。",
        "planned": false
      },
      {
        "key": "curated_agents.manage",
        "name": "管理精选专家",
        "description": "创建和维护本人创建的精选专家。",
        "planned": false
      },
      {
        "key": "curated_agents.publish",
        "name": "发布精选专家",
        "description": "发布经过审核的专家配置。",
        "planned": false
      },
      {
        "key": "curated_agents.distribute",
        "name": "分发精选专家",
        "description": "在依赖权限完整时向用户分发精选专家。",
        "planned": false
      }
    ]
  },
  {
    "name": "MCP 市场",
    "permissions": [
      {
        "key": "curated_mcps.view",
        "name": "查看精选 MCP",
        "description": "查看精选 MCP、分发状态和安装记录。",
        "planned": false
      },
      {
        "key": "curated_mcps.manage",
        "name": "管理精选 MCP",
        "description": "创建和维护本人创建的精选 MCP。",
        "planned": false
      },
      {
        "key": "curated_mcps.publish",
        "name": "发布精选 MCP",
        "description": "发布经过安全校验和版本固定的 MCP 配置。",
        "planned": false
      },
      {
        "key": "curated_mcps.distribute",
        "name": "分发精选 MCP",
        "description": "向当前账号名下用户分发精选 MCP。",
        "planned": false
      }
    ]
  },
  {
    "name": "技能市场",
    "permissions": [
      {
        "key": "curated_skills.view",
        "name": "查看精选技能",
        "description": "查看官方候选技能、分发状态和安装记录。",
        "planned": false
      },
      {
        "key": "curated_skills.manage",
        "name": "管理自有技能",
        "description": "创建和维护本人创建的精选技能草稿。",
        "planned": false
      },
      {
        "key": "curated_skills.publish",
        "name": "发布自有技能",
        "description": "上传、签名、发布和撤销本人创建的精选技能版本。",
        "planned": false
      },
      {
        "key": "curated_skills.distribute",
        "name": "分发精选技能",
        "description": "为当前账号名下用户配置技能版本、会员范围和交付策略。",
        "planned": false
      },
      {
        "key": "curated_skills.audit",
        "name": "技能审计",
        "description": "查看精选技能发布、租约和安装审计。",
        "planned": false
      }
    ]
  },
  {
    "name": "账号中心",
    "permissions": [
      {
        "key": "organizations.view",
        "name": "组织主体",
        "description": "查看当前独立主体、员工和部署归属。",
        "planned": false
      },
      {
        "key": "organizations.members.manage",
        "name": "组织成员管理",
        "description": "维护当前组织内部成员、岗位角色和数据范围。",
        "planned": false
      },
      {
        "key": "organizations.audit.view",
        "name": "组织审计",
        "description": "查看组织、成员和能力授权变更记录。",
        "planned": false
      },
      {
        "key": "personal_features.use",
        "name": "个人能力预设",
        "description": "兼容个人主体授权预设；具体功能仍由拆分后的个人能力决定。",
        "planned": false
      },
      {
        "key": "users.manage",
        "name": "后台账号",
        "description": "创建、编辑、停用当前组织的管理员、运营、财务、技术和只读账号。",
        "planned": false
      },
      {
        "key": "user_groups.manage",
        "name": "账号分组",
        "description": "按组织、渠道或岗位维护后台账号分组。",
        "planned": true
      },
      {
        "key": "permissions.manage",
        "name": "权限管理",
        "description": "维护角色、账号分组和权限点的授权关系。",
        "planned": true
      },
      {
        "key": "authorization.view",
        "name": "授权状态",
        "description": "查看独立授权中心授予当前经营主体的能力边界。",
        "planned": false
      }
    ]
  },
  {
    "name": "贴牌交付",
    "permissions": [
      {
        "key": "projects.manage",
        "name": "AI 项目管理",
        "description": "维护贴牌项目资料、品牌素材和客户端菜单。",
        "planned": false
      },
      {
        "key": "builds.create",
        "name": "提交测试打包",
        "description": "向官方构建中心提交测试版打包任务。",
        "planned": false
      },
      {
        "key": "builds.publish",
        "name": "推送正式版本",
        "description": "将测试包推送到用户更新通道。",
        "planned": false
      }
    ]
  },
  {
    "name": "商业运营",
    "permissions": [
      {
        "key": "client_notices.view",
        "name": "查看消息推送",
        "description": "查看当前数据范围内的通知草稿和发送历史。",
        "planned": false
      },
      {
        "key": "client_notices.publish",
        "name": "发送消息推送",
        "description": "创建、编辑、发送和撤回当前数据范围内的通知。",
        "planned": false
      },
      {
        "key": "user_usage.view",
        "name": "查看使用报表",
        "description": "查看授权用户的模型使用与积分消耗。",
        "planned": false
      },
      {
        "key": "user_usage.export",
        "name": "导出使用报表",
        "description": "导出授权用户的使用报表 CSV。",
        "planned": false
      },
      {
        "key": "end_users.manage",
        "name": "终端用户管理",
        "description": "查看终端注册用户并维护状态、密码、模型授权和积分。",
        "planned": false
      },
      {
        "key": "memberships.manage",
        "name": "会员卡管理",
        "description": "创建会员卡、维护套餐和为终端用户分配会员权益。",
        "planned": false
      },
      {
        "key": "payments.manage",
        "name": "支付中心",
        "description": "配置当前账号的微信和支付宝商户参数，并管理会员支付订单。",
        "planned": false
      },
      {
        "key": "credits.manage",
        "name": "积分管理",
        "description": "调整终端用户积分并查看消耗流水。",
        "planned": false
      },
      {
        "key": "redeem_codes.manage",
        "name": "兑换码管理",
        "description": "生成、查看和删除积分兑换码。",
        "planned": false
      }
    ]
  },
  {
    "name": "模型服务",
    "permissions": [
      {
        "key": "model_providers.manage",
        "name": "服务商管理",
        "description": "维护模型服务商、接口地址和连接配置；新增、编辑、停用和删除仍受供应商授权限制。",
        "planned": false
      },
      {
        "key": "model_keys.manage",
        "name": "Key 池管理",
        "description": "维护服务商凭据、轮询策略和 MiniMax 单 Key；资源账号由系统自动管理。",
        "planned": false
      },
      {
        "key": "provider_models.manage",
        "name": "模型管理",
        "description": "维护模型分类、展示能力和上下文配置；任务协议与端点由系统自动管理。",
        "planned": false
      },
      {
        "key": "pricing_rules.manage",
        "name": "计费中心",
        "description": "维护文本与搜索、图片、语音与音频的复合计费方案、售价和消费倍率。",
        "planned": false
      }
    ]
  },
  {
    "name": "系统",
    "permissions": [
      {
        "key": "platform_settings.manage",
        "name": "平台设置",
        "description": "配置后台品牌、官方构建中心、安装包存储和旧模型配置。",
        "planned": false
      },
      {
        "key": "self_update.manage",
        "name": "系统更新",
        "description": "检查和应用管理后台自更新。",
        "planned": false
      },
      {
        "key": "diagnostics.view",
        "name": "系统诊断",
        "description": "查看公网地址、更新目录、最近构建和运行日志。",
        "planned": false
      },
      {
        "key": "account_security.manage",
        "name": "账号安全",
        "description": "修改当前登录账号密码。",
        "planned": false
      }
    ]
  }
]
export const CAPABILITY_KEYS = CAPABILITY_GROUPS.flatMap(group => group.permissions.map(p => p.key))
