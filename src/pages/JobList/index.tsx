import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockJobList } from './mockData';
import type { JobItem } from './mockData';
import './styles.css';
import JobFormDrawer from './JobFormDrawer';

const { Option } = Select;

const JobList: React.FC = () => {
  const [searchType, setSearchType] = useState('全文');
  const [searchValue, setSearchValue] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [managerFilter, setManagerFilter] = useState<string | undefined>(undefined);
  const [deliveryManager, setDeliveryManager] = useState('');
  const [deliveryManagerInput, setDeliveryManagerInput] = useState('');
  const [deliveryConsultant, setDeliveryConsultant] = useState('');
  const [deliveryConsultantInput, setDeliveryConsultantInput] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>('进行中');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [jobList, setJobList] = useState<JobItem[]>(mockJobList);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<JobItem | undefined>(undefined);
  const tableScrollAreaRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number | undefined>(undefined);

  useEffect(() => {
    const calcHeight = () => {
      if (tableScrollAreaRef.current) {
        const height = tableScrollAreaRef.current.clientHeight;
        setScrollY(Math.max(100, height - 48));
      }
    };
    calcHeight();
    const ro = new ResizeObserver(calcHeight);
    if (tableScrollAreaRef.current) {
      ro.observe(tableScrollAreaRef.current);
    }
    window.addEventListener('resize', calcHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calcHeight);
    };
  }, []);

  const searchTypeOptions = ['全文', '职位名称', '客户名称', '联系人'];

  const getCompanyLevelClass = (level: string) => {
    switch (level) {
      case '大厂':
        return 'large';
      case '中厂':
        return 'medium';
      case '小厂':
        return 'small';
      default:
        return 'small';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case '一级':
        return 'high';
      case '二级':
        return 'medium';
      case '三级':
        return 'low';
      default:
        return 'low';
    }
  };

  const filteredData = useMemo(() => {
    let data = [...jobList];

    if (searchValue) {
      data = data.filter((item) => {
        const value = searchValue.toLowerCase();
        if (searchType === '全文') {
          return (
            item.jobName.toLowerCase().includes(value) ||
            item.customerName.toLowerCase().includes(value) ||
            item.contactPerson.toLowerCase().includes(value)
          );
        }
        if (searchType === '职位名称') return item.jobName.toLowerCase().includes(value);
        if (searchType === '客户名称') return item.customerName.toLowerCase().includes(value);
        if (searchType === '联系人') return item.contactPerson.toLowerCase().includes(value);
        return true;
      });
    }

    if (deliveryManager) {
      data = data.filter((item) => item.deliveryManager.includes(deliveryManager));
    }
    if (deliveryConsultant) {
      data = data.filter((item) => item.deliveryConsultant.includes(deliveryConsultant));
    }

    if (statusFilter) {
      data = data.filter((item) => item.jobStatus === statusFilter);
    }

    if (managerFilter) {
      data = data.filter((item) => {
        if (managerFilter === '是') {
          return item.isManager === '是' || item.isManager.startsWith('是');
        }
        return item.isManager === managerFilter;
      });
    }

    if (priorityFilter) {
      data = data.filter((item) => item.priority === priorityFilter);
    }

    return data;
  }, [jobList, searchValue, searchType, deliveryManager, deliveryConsultant, statusFilter, managerFilter, priorityFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; onRemove: () => void }[] = [];
    if (searchValue) {
      filters.push({ key: 'search', label: `${searchType}: ${searchValue}`, onRemove: () => setSearchValue('') });
    }
    if (managerFilter) {
      filters.push({ key: 'managerFilter', label: `是否为管理岗: ${managerFilter}`, onRemove: () => setManagerFilter(undefined) });
    }
    if (deliveryManager) {
      filters.push({ key: 'deliveryManager', label: `交付经理: ${deliveryManager}`, onRemove: () => setDeliveryManager('') });
    }
    if (deliveryConsultant) {
      filters.push({ key: 'deliveryConsultant', label: `交付顾问: ${deliveryConsultant}`, onRemove: () => setDeliveryConsultant('') });
    }
    if (priorityFilter) {
      filters.push({ key: 'priorityFilter', label: `优先级: ${priorityFilter}`, onRemove: () => setPriorityFilter(undefined) });
    }
    if (statusFilter) {
      filters.push({ key: 'statusFilter', label: `职位状态: ${statusFilter}`, onRemove: () => setStatusFilter(undefined) });
    }
    return filters;
  }, [searchValue, managerFilter, deliveryManager, deliveryConsultant, priorityFilter, statusFilter]);

  const columns: ColumnsType<JobItem> = [
    {
      title: '职位名称',
      key: 'jobName',
      width: 220,
      render: (_, record) => (
        <div className="job-name-cell">
          <span className="job-name-text">{record.jobName}</span>
          {record.isNew && <span className="new-tag">新</span>}
        </div>
      ),
    },
    {
      title: '职位状态',
      dataIndex: 'jobStatus',
      key: 'jobStatus',
      width: 80,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '进行中': 'success',
          '已暂停': 'warning',
          '已关闭': 'error',
        };
        return (
          <Tag color={colorMap[status] || 'default'} style={{ fontSize: 12, borderRadius: 4 }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '公司级别',
      dataIndex: 'companyLevel',
      key: 'companyLevel',
      width: 80,
      render: (level: string) => (
        <span className={`company-level-tag ${getCompanyLevelClass(level)}`}>{level}</span>
      ),
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
      ellipsis: true,
    },
    {
      title: '工作地点',
      dataIndex: 'workLocation',
      key: 'workLocation',
      width: 120,
      ellipsis: true,
    },
    {
      title: '是否为管理岗',
      dataIndex: 'isManager',
      key: 'isManager',
      width: 100,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 70,
      render: (priority: string) => (
        <span className={`priority-tag ${getPriorityClass(priority)}`}>{priority}</span>
      ),
    },
    {
      title: '交付经理',
      dataIndex: 'deliveryManager',
      key: 'deliveryManager',
      width: 100,
      ellipsis: true,
    },
    {
      title: '交付顾问',
      dataIndex: 'deliveryConsultant',
      key: 'deliveryConsultant',
      width: 100,
      ellipsis: true,
    },

    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Tooltip title="编辑">
          <EditOutlined
            style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }}
            onClick={() => {
              setEditingRecord(record);
              setDrawerVisible(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    const maxVisible = 5;

    pages.push(
      <button
        key="prev"
        className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        {'<'}
      </button>
    );

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={`page-btn ${currentPage === i ? 'active' : ''}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          className={`page-btn ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(
          <span key="ellipsis1" className="page-ellipsis">
            ...
          </span>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            className={`page-btn ${currentPage === i ? 'active' : ''}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis2" className="page-ellipsis">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        {'>'}
      </button>
    );

    return pages;
  };

  return (
    <div className="job-list-page">
      {/* 搜索区域 */}
      <div className="search-section">
        <div className="search-row">
          <div className="search-input-group">
            <Select
              value={searchType}
              onChange={setSearchType}
              className="search-type-select"
            >
              {searchTypeOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
            <Input
              placeholder="输入并回车"
              className="search-main-input"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onPressEnter={() => {
                setSearchValue(searchInputValue);
              }}
              suffix={<SearchOutlined style={{ color: '#bbb' }} />}
            />
          </div>

          <div className="filter-item">
            <Input
              placeholder="输入交付经理并回车"
              value={deliveryManagerInput}
              onChange={(e) => setDeliveryManagerInput(e.target.value)}
              onPressEnter={() => setDeliveryManager(deliveryManagerInput)}
              style={{ width: 180 }}
            />
          </div>
          <div className="filter-item">
            <Input
              placeholder="请输入交付顾问并回车"
              value={deliveryConsultantInput}
              onChange={(e) => setDeliveryConsultantInput(e.target.value)}
              onPressEnter={() => setDeliveryConsultant(deliveryConsultantInput)}
              style={{ width: 180 }}
            />
          </div>
        </div>

        <div className="search-row">
          <div className="filter-item">
            <span className="filter-label">职位状态</span>
            <Select
              placeholder="请选择"
              allowClear
              className="filter-select"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
            >
              <Option value="进行中">进行中</Option>
              <Option value="已暂停">已暂停</Option>
              <Option value="已关闭">已关闭</Option>
            </Select>
          </div>

          <div className="filter-item">
            <span className="filter-label">是否为管理岗</span>
            <Select
              placeholder="请选择"
              allowClear
              className="filter-select manager-select"
              value={managerFilter}
              onChange={setManagerFilter}
              style={{ width: 160 }}
            >
              <Option value="是">是</Option>
              <Option value="否">否</Option>
            </Select>
          </div>

          <div className="filter-item">
            <span className="filter-label">优先级</span>
            <Select
              placeholder="请选择"
              allowClear
              className="filter-select"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: 160 }}
            >
              <Option value="一级">一级</Option>
              <Option value="二级">二级</Option>
              <Option value="三级">三级</Option>
            </Select>
          </div>
        </div>

        <div className="status-filter-row">
          <div className="status-tags">
            {activeFilters.length > 0 && (
              <>
                <span style={{ color: '#888', fontSize: 13, marginRight: 4, whiteSpace: 'nowrap' }}>已选筛选:</span>
                {activeFilters.map((filter) => (
                  <span key={filter.key} className="status-tag active">
                    {filter.label}
                    <CloseOutlined
                      className="remove-icon"
                      onClick={filter.onRemove}
                    />
                  </span>
                ))}
              </>
            )}
          </div>
          <div className="action-btns">
            {activeFilters.length > 0 && (
              <Button
                size="small"
                className="action-btn-small"
                danger
                onClick={() => {
                  setSearchValue('');
                  setSearchInputValue('');
                  setDeliveryManager('');
                  setDeliveryManagerInput('');
                  setDeliveryConsultant('');
                  setDeliveryConsultantInput('');
                  setManagerFilter(undefined);
                  setPriorityFilter(undefined);
                  setStatusFilter(undefined);
                }}
              >
                清空
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="stats-section">
        <div className="stats-right" style={{ marginLeft: 'auto' }}>
          <Button icon={<DownloadOutlined />} className="export-btn" onClick={() => message.info('此功能暂未开发')}>
            Excle导出
          </Button>
          <Button type="primary" icon={<PlusOutlined />} className="add-btn" onClick={() => { setEditingRecord(undefined); setDrawerVisible(true); }}>
            新增
          </Button>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="table-section">
        <div className="table-scroll-area" ref={tableScrollAreaRef}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            pagination={false}
            scroll={{ x: 2200, y: scrollY }}
          />
        </div>

        {/* 底部操作栏 */}
        <div className="bottom-bar">
          <span className="pagination-info">
            耗时：0.746S
          </span>
          <div className="bottom-right">
            <span className="pagination-info">
              共{filteredData.length}条
            </span>
            <div className="custom-pagination">{renderPageNumbers()}</div>
            <span style={{ fontSize: 13, color: '#888' }}>
              前往 <Input size="small" style={{ width: 40, textAlign: 'center' }} value={currentPage} onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }} /> 页
            </span>
          </div>
        </div>
      </div>

      <JobFormDrawer
        visible={drawerVisible}
        initialData={editingRecord}
        onClose={() => {
          setDrawerVisible(false);
          setEditingRecord(undefined);
        }}
        onSubmit={(job) => {
          if (editingRecord) {
            setJobList((prev) => prev.map((item) => (item.id === editingRecord.id ? job : item)));
          } else {
            setJobList((prev) => [job, ...prev]);
          }
          setDrawerVisible(false);
          setEditingRecord(undefined);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default JobList;
