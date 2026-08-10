# 修复横向滚动条不显示问题

## 问题分析

当前代码中，横向滚动条未显示的原因在于：

1. `.table-scroll-area` 设置了 `overflow: hidden`，用于避免页面级滚动。
2. `scrollY` 的计算值为 `height - 8`，仅为 Table 的 tbody 内容区分配了几乎等于父容器全部高度的空间。
3. Ant Design Table 的总高度 = 表头高度 + tbody 高度(scrollY) + 横向滚动条高度(约 8-12px)。
4. 由于 `scrollY` 预留空间不足，Table 总高度超出了 `.table-scroll-area`，其超出部分（即底部的横向滚动条）被 `overflow: hidden` 裁剪掉了。

## 修复方案

### 1. 调整 scrollY 计算逻辑

**文件**: `src/pages/JobList/index.tsx`

将 `setScrollY(height - 8)` 修改为 `setScrollY(height - 52)`，为表头（约 40px）和横向滚动条（约 8-12px）预留足够空间，确保 Table 总高度不超过父容器，横向滚动条能够完整显示。

```tsx
// 修改前
const height = tableScrollAreaRef.current.clientHeight;
setScrollY(height - 8);

// 修改后
const height = tableScrollAreaRef.current.clientHeight;
setScrollY(Math.max(100, height - 52));
```

增加 `Math.max(100, ...)` 保护，避免容器极小时出现负数或过小的高度值。

### 2. 增强滚动条 CSS 优先级

**文件**: `src/pages/JobList/styles.css`

当前选择器 `.ant-table-body` 和 `.ant-table-content` 的优先级可能不足以覆盖 antd 6.x 的默认样式。提升选择器优先级，并确保 `overflow` 行为正确。

```css
/* 增强选择器优先级，确保覆盖 antd 默认样式 */
.table-scroll-area .ant-table-wrapper .ant-table-body,
.table-scroll-area .ant-table-wrapper .ant-table-content {
  scrollbar-width: auto !important;
  -ms-overflow-style: scrollbar !important;
  overflow-x: auto !important;
}

.table-scroll-area .ant-table-wrapper .ant-table-body::-webkit-scrollbar,
.table-scroll-area .ant-table-wrapper .ant-table-content::-webkit-scrollbar {
  height: 10px;
  display: block !important;
}

.table-scroll-area .ant-table-wrapper .ant-table-body::-webkit-scrollbar-track,
.table-scroll-area .ant-table-wrapper .ant-table-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.table-scroll-area .ant-table-wrapper .ant-table-body::-webkit-scrollbar-thumb,
.table-scroll-area .ant-table-wrapper .ant-table-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 5px;
}

.table-scroll-area .ant-table-wrapper .ant-table-body::-webkit-scrollbar-thumb:hover,
.table-scroll-area .ant-table-wrapper .ant-table-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

### 3. 调整 .table-scroll-area 的 padding

**文件**: `src/pages/JobList/styles.css`

当前 `.table-section` 有 `padding: 16px`，而 `.table-scroll-area` 没有额外 padding。确保底部有足够的空间容纳滚动条。

可选调整：将 `.table-scroll-area` 的 `overflow: hidden` 保持不变，但增加底部 padding 为滚动条留出显示空间；或者保持当前结构，依赖 scrollY 的精确计算。

## 验证步骤

1. 启动项目 (`npm run dev`)，打开职位列表页面。
2. 检查表格底部是否出现横向滚动条。
3. 尝试用鼠标拖动横向滚动条，确认可以正常左右滚动。
4. 调整浏览器窗口高度，验证 ResizeObserver 动态计算后滚动条仍然正常显示。
5. 确认页面整体未出现滚动条，仅在表格内部出现横向滚动条。
