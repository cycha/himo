import React from 'react';
import { Form, Input, Button, Select, Row, Col } from 'antd';
import { SearchOutlined, EuroOutlined } from '@ant-design/icons';
import type { SearchFilters as SearchFiltersType } from '../../types';

const { Option } = Select;

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
  loading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const filters: SearchFiltersType = {
      type: values.type,
      priceMin: values.priceMin ? Number(values.priceMin) : undefined,
      priceMax: values.priceMax ? Number(values.priceMax) : undefined,
      surfaceMin: values.surfaceMin ? Number(values.surfaceMin) : undefined,
      surfaceMax: values.surfaceMax ? Number(values.surfaceMax) : undefined,
      page: 0,
    };
    onSearch(filters);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="type" label="Property Type">
            <Select placeholder="Select type" allowClear>
              <Option value="appartement">Appartement</Option>
              <Option value="maison">Maison</Option>
              <Option value="terrain">Terrain</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="priceMin" label="Min Price (€)">
            <Input type="number" placeholder="0" prefix={<EuroOutlined />} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="priceMax" label="Max Price (€)">
            <Input type="number" placeholder="1000000" prefix={<EuroOutlined />} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="surfaceMin" label="Min Surface (m²)">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SearchOutlined />}
          size="large"
          block
          loading={loading}
        >
          Search
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SearchFilters;
