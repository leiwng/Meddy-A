# 医小助 - 智能染色体分析助手

医小助是一个基于LangGraph框架开发的智能助手系统，专注于染色体图像分析和医疗对话。该系统由科莫生科技有限公司开发，旨在为医疗专业人员提供高效的染色体分析工具和专业的医疗咨询服务。

## 核心功能

### 1. 染色体图像分析
- **图像预处理**
  - 自动去除背景
  - 图像分割优化
- **智能识别分类**
  - 染色体实例分割
  - 自动分类识别
  - 结果可视化展示

### 2. 智能对话系统
- 专业医疗咨询
- 用户记忆管理
- 多模态交互支持

### 3. RAG知识检索
- 支持PDF文档处理
- 智能文本分块
- 向量化存储与检索

## 技术架构

### 核心框架
- LangGraph：对话流程管理
- LangChain：大语言模型集成
- FastAPI：Web服务框架
- OpenCV：图像处理

### 模型支持
- 支持多种大语言模型：
  - Deepseek-r1 (32B)
  - Qwen2.5 (32B)
  - Qwen-plus

## 快速开始

### 环境要求
- Python 3.11+
- CUDA支持（推荐用于图像处理）

### 安装步骤

1. 克隆项目并安装依赖
```bash
pip install -r source_code/requirements.txt
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，配置必要的API密钥和服务地址
```

3. 启动服务
```bash
# 使用Docker
docker build -t my_agent .
docker run -p 8000:8000 my_agent
```

## 系统配置

主要配置项在 `source_code/agent/configuration.py` 中定义：
- 模型选择
- 专家模式开关
- RAG模式配置
- 用户ID管理

## API服务

系统提供以下核心API服务：
- 染色体图像处理API
- 对话管理API
- 用户认证API
- 文档处理API

## 开发指南

### 项目结构
```
source_code/
├── agent/          # 核心智能体实现
├── api/            # API接口定义
├── db/             # 数据库管理
├── security/       # 安全认证
└── tools/          # 工具集合
```

### 自定义开发
1. 添加新的工具：在 `tools/` 目录下创建新的工具类
2. 扩展对话流程：修改 `agent/graph.py` 中的状态图
3. 配置新的模型：更新 `agent/llm.py` 中的模型配置

## 许可证

本项目基于 MIT 许可证开源。

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目。请确保在提交代码前：
1. 运行代码格式化工具
2. 完成单元测试
3. 更新相关文档

## 联系方式

如有问题或建议，请通过以下方式联系我们：
- 提交Issue
- 发送邮件至[support@example.com]