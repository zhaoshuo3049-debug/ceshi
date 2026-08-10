# 是否为管理岗 placeholder 字号调整计划

## 摘要
将新增/编辑职位表单中"是否为管理岗"字段的 Select 组件引导文案（placeholder）"请选择"字号缩小 2px，仅修改该字段，不影响其他 Select 组件。

## 当前状态分析
- 文件：`src/pages/JobList/JobFormDrawer.tsx`（组件）、`src/pages/JobList/styles.css`（样式）
- "是否为管理岗"字段位于第 262~271 行，使用 `<Select placeholder="请选择">`
- Ant Design Select 的 placeholder 默认通过 `.ant-select-selection-placeholder` 渲染
- 当前未对该字段单独设置 className，无法单独控制 placeholder 样式

## 拟变更内容

### 1. JobFormDrawer.tsx — 添加专属 className
- **位置**：第 267 行，`<Select placeholder="请选择">`
- **操作**：添加 `className="manager-select-placeholder"`
- **理由**：需要精确选择器，仅命中该字段的 placeholder，不影响其他 Select

### 2. styles.css — 新增样式规则
- **位置**：文件末尾或表单样式区块内
- **操作**：新增
  ```css
  .manager-select-placeholder .ant-select-selection-placeholder {
    font-size: 12px;
  }
  ```
- **理由**：Ant Design 默认 placeholder 字号为 14px，缩小 2px 后为 12px

## 假设与决策
- Ant Design 默认 placeholder 字号为 14px，目标字号为 12px（缩小 2px）。
- 仅通过 CSS 类选择器缩小字号，不改写自定义 placeholder 组件，保持实现最简。

## 验证步骤
1. 打开新增职位表单或编辑职位表单。
2. 查看"是否为管理岗"字段未选择时的 placeholder 文字"请选择"。
3. 确认其字号比其他字段的"请选择"略小。
4. 确认其他字段（职位状态、公司级别、优先级等）的 placeholder 字号保持原样。
