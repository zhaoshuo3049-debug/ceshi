# 缩小复选框左侧展开列宽度计划

## Summary
用户反馈表格中复选框左侧的展开列（`ant-table-row-expand-icon-cell`）宽度过大，要求大幅缩小。根因是当前代码中同时存在 antd 自动生成的展开列和手动定义的 `key: 'expand'` 列，且自动展开列未限制宽度。

## Current State Analysis
- **文件**: `src/pages/JobList/index.tsx`
- **问题**: Table 的 `expandable` 配置使 antd 在最左侧自动生成展开列（class: `ant-table-row-expand-icon-cell`）。同时 `columns` 数组中又手动定义了一个 `key: 'expand'` 的列（width: 30）用于渲染展开箭头。两列并存导致左侧区域过宽。
- **当前 expandable 配置**:
  ```tsx
  expandable={{
    expandedRowKeys,
    onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
    expandedRowRender,
    expandIcon: () => null, // 隐藏了默认图标，但列仍在
  }}
  ```
- **当前手动 expand 列**:
  ```tsx
  {
    title: '',
    key: 'expand',
    width: 30,
    fixed: 'left',
    render: (_, record) => (...),
  }
  ```

## Proposed Changes

### 1. `src/pages/JobList/index.tsx` — 合并展开列并限制宽度
- **操作**: 移除 `columns` 数组中 `key: 'expand'` 的手动展开列。
- **操作**: 修改 Table 的 `expandable` 配置：
  - 移除 `expandIcon: () => null`
  - 添加自定义 `expandIcon` 渲染 `DownOutlined` / `RightOutlined` 图标
  - 添加 `columnWidth: 24` 大幅缩小自动展开列宽度
- **Why**: 只保留 antd 自动展开列一列，避免重复；`columnWidth: 24` 将宽度从默认的约 50px 大幅压缩到 24px。

### 2. `src/pages/JobList/styles.css` — 压缩展开列内边距（可选增强）
- **操作**: 添加样式规则进一步压缩展开列的横向 padding：
  ```css
  .ant-table-row-expand-icon-cell {
    padding-inline: 4px !important;
  }
  ```
- **Why**: antd 默认单元格 padding 为 16px，覆盖后可进一步缩小视觉宽度。

## Verification
- 浏览器预览中选中复选框左侧的 `th`/`td`，检查其宽度是否明显缩小（约 24px 级别）。
- 确认展开/折叠箭头功能正常。
- 确认没有其他布局错乱。
