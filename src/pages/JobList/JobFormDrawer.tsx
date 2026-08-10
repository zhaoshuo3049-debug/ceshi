import React, { useEffect, useRef, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { JobItem } from './mockData';

const { Option } = Select;
const { TextArea } = Input;

interface JobFormDrawerProps {
  visible: boolean;
  initialData?: JobItem;
  onClose: () => void;
  onSubmit: (values: JobItem) => void;
}

const JobFormDrawer: React.FC<JobFormDrawerProps> = ({
  visible,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);
  const [draftValues, setDraftValues] = useState<Record<string, any> | undefined>(undefined);
  const draftValuesRef = useRef<Record<string, any> | undefined>(undefined);
  draftValuesRef.current = draftValues;

  const provinceCityMap: Record<string, string[]> = {
    北京: ['北京市'],
    上海: ['上海市'],
    天津: ['天津市'],
    重庆: ['重庆市'],
    浙江: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
    江苏: ['南京市', '苏州市', '无锡市', '常州市', '南通市', '扬州市', '徐州市', '连云港市', '淮安市', '盐城市', '镇江市', '泰州市', '宿迁市'],
    广东: ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
    四川: ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市'],
    湖北: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市'],
    湖南: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市'],
    山东: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
    河南: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
    福建: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
    安徽: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
    河北: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
    陕西: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
    辽宁: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
    江西: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
    山西: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
    黑龙江: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市'],
    吉林: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
    云南: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
    贵州: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
    广西: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
    内蒙古: ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
    新疆: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区'],
    西藏: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
    海南: ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市', '东方市', '定安县', '屯昌县', '澄迈县', '临高县', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县'],
    甘肃: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
    青海: ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
    宁夏: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  };

  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.resetFields();
        const locationParts = initialData.workLocation.split('-');
        const province = locationParts[0] || '';
        const city = locationParts.slice(1).join('-') || '';
        setSelectedProvince(province);
        form.setFieldsValue({
          jobName: initialData.jobName,
          jobStatus: initialData.jobStatus,
          customerName: initialData.customerName,
          companyLevel: initialData.companyLevel,
          contactPerson: initialData.contactPerson,
          province,
          city,
          isManager: initialData.isManager,
          priority: initialData.priority,
          deliveryManager: initialData.deliveryManager,
          deliveryConsultant: initialData.deliveryConsultant,
          jobDescription: initialData.jobDescription || '',
        });
      } else if (draftValuesRef.current) {
        form.setFieldsValue(draftValuesRef.current);
        setSelectedProvince(draftValuesRef.current.province);
      } else {
        form.resetFields();
        setSelectedProvince(undefined);
        form.setFieldsValue({
          jobStatus: '进行中',
        });
      }
      // 直接修改是否为管理岗 placeholder 字号
      const applySmallFont = () => {
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
          if (label.textContent?.includes('是否为管理岗')) {
            const formItem = label.closest('.ant-form-item');
            if (formItem) {
              const select = formItem.querySelector('.ant-select');
              if (select) {
                const placeholder = select.querySelector('[class*="placeholder"]') as HTMLElement;
                if (placeholder) {
                  placeholder.style.setProperty('font-size', '12px', 'important');
                  placeholder.style.setProperty('line-height', '22px', 'important');
                  placeholder.style.setProperty('display', 'inline-flex', 'important');
                  placeholder.style.setProperty('align-items', 'center', 'important');
                }
              }
            }
            break;
          }
        }
      };
      const timer = setInterval(applySmallFont, 200);
      setTimeout(() => clearInterval(timer), 3000);
    }
  }, [visible, form, initialData]);

  const handleFinish = (values: any) => {
    const job: JobItem = {
      id: initialData ? initialData.id : Date.now().toString(),
      isNew: initialData ? initialData.isNew : true,
      jobName: values.jobName,
      jobStatus: values.jobStatus,
      customerName: values.customerName,
      companyLevel: values.companyLevel,
      contactPerson: values.contactPerson,
      workLocation: `${values.province}-${values.city}`,
      isManager: values.isManager,
      priority: values.priority,
      deliveryManager: values.deliveryManager || '',
      deliveryConsultant: values.deliveryConsultant || '',
      createTime: initialData ? initialData.createTime : dayjs().format('YYYY.MM.DD'),
      jobDescription: values.jobDescription || '',
    };
    if (!initialData) {
      setDraftValues(undefined);
    }
    onSubmit(job);
  };

  return (
    <Drawer
      title={initialData ? '编辑职位' : '新增职位'}
      width={520}
      open={visible}
      onClose={onClose}
      closable={{ closeIcon: <CloseOutlined style={{ fontSize: 16, color: '#666' }} /> }}
      className="job-form-drawer"
      footer={
        <div className="job-form-footer">
          <Button type="primary" onClick={() => form.submit()}>
            确定
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={() => {
          if (!initialData) {
            setDraftValues(form.getFieldsValue());
          }
        }}
        className="job-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="职位名称"
              name="jobName"
              rules={[{ required: true, message: '请输入职位名称' }]}
            >
              <Input placeholder="请输入" maxLength={20} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="职位状态"
              name="jobStatus"
              rules={[{ required: true, message: '请选择职位状态' }]}
            >
              <Select placeholder="请选择">
                <Option value="进行中">进行中</Option>
                <Option value="已暂停">已暂停</Option>
                <Option value="已关闭">已关闭</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="客户名称"
              name="customerName"
              rules={[{ required: true, message: '请输入客户名称' }]}
            >
              <Input placeholder="请输入" maxLength={20} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="公司级别"
              name="companyLevel"
              rules={[{ required: true, message: '请选择公司级别' }]}
            >
              <Select placeholder="请选择">
                <Option value="大厂">大厂</Option>
                <Option value="中厂">中厂</Option>
                <Option value="小厂">小厂</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="联系人"
              name="contactPerson"
              rules={[{ required: true, message: '请输入联系人' }]}
            >
              <Input placeholder="请输入" maxLength={20} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="工作地点" required>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="province"
                    noStyle
                    rules={[{ required: true, message: '请选择省份' }]}
                  >
                    <Select
                      placeholder="省份"
                      onChange={(value) => {
                        setSelectedProvince(value);
                        form.setFieldsValue({ city: undefined });
                      }}
                    >
                      {Object.keys(provinceCityMap).map((province) => (
                        <Option key={province} value={province}>
                          {province}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="city"
                    noStyle
                    rules={[{ required: true, message: '请选择城市' }]}
                  >
                    <Select placeholder="城市" disabled={!selectedProvince}>
                      {(provinceCityMap[selectedProvince || ''] || []).map((city) => (
                        <Option key={city} value={city}>
                          {city}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="是否为管理岗"
              name="isManager"
              className="manager-form-item"
              rules={[{ required: true, message: '请选择是否为管理岗' }]}
            >
              <Select placeholder="请选择" popupClassName="manager-select-popup">
                <Option value="是">是</Option>
                <Option value="否">否</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="优先级"
              name="priority"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="请选择">
                <Option value="一级">一级</Option>
                <Option value="二级">二级</Option>
                <Option value="三级">三级</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="交付经理"
              name="deliveryManager"
              rules={[{ required: true, message: '请输入交付经理' }]}
            >
              <Input placeholder="请输入" maxLength={20} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="交付顾问"
              name="deliveryConsultant"
              rules={[{ required: true, message: '请输入交付顾问' }]}
            >
              <Input placeholder="请输入" maxLength={20} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="职位 JD"
          name="jobDescription"
        >
          <TextArea rows={4} placeholder="请输入职位 JD" maxLength={500} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default JobFormDrawer;
