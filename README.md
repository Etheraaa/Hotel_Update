# 酒店升房情报网站 V1

## 目录

- `frontend`：Next.js 前台网站
- `backend`：Express API 服务
- `data`：SQLite schema、种子数据和本地数据库文件

## 启动方式

先初始化数据库：

```bash
cd /Users/bytedance/Desktop/VB1/code/backend
npm run db:reset
```

启动后端：

```bash
cd /Users/bytedance/Desktop/VB1/code/backend
npm run dev
```

后端默认运行在 `http://localhost:4000`。

启动前端：

```bash
cd /Users/bytedance/Desktop/VB1/code/frontend
npm run dev
```

前端默认运行在 `http://localhost:3000`。

## 替换示例数据

后续整理真实数据时，优先替换这些文件：

- `data/seeds/hotels.seed.json`
- `data/seeds/upgrade-stats.seed.json`
- `data/seeds/raw-upgrade-cases.seed.json`

替换后重新运行：

```bash
cd /Users/bytedance/Desktop/VB1/code/backend
npm run db:reset
```

前端不直接读取数据库。只要后端接口字段保持稳定，替换数据不需要改前端页面结构。

## 主要接口

- `GET /api/hotels`
- `GET /api/hotels/filters`
- `GET /api/hotels/:hotelId`
- `GET /api/hotels/:hotelId/upgrade-stats`

## 质量检查

后端：

```bash
cd /Users/bytedance/Desktop/VB1/code/backend
npm test
npm run build
```

前端：

```bash
cd /Users/bytedance/Desktop/VB1/code/frontend
npm test
npm run build
```
