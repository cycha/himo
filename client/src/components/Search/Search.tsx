import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Row, Col, List, Typography, Empty } from 'antd';
import { SearchOutlined, EuroOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import type { SearchFilters, Ad } from '../../types';
import './Search.css';

const { Option } = Select;
const { Text } = Typography;

const Search: React.FC = () => {
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<SearchFilters>({ page: 0 });
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['ads', filters],
    queryFn: () => api.searchAds(filters),
    enabled: hasSearched,
  });

  const onFinish = (values: any) => {
    const searchFilters: SearchFilters = {
      type: values.type,
      priceMin: values.priceMin ? Number(values.priceMin) : undefined,
      priceMax: values.priceMax ? Number(values.priceMax) : undefined,
      surfaceMin: values.surfaceMin ? Number(values.surfaceMin) : undefined,
      surfaceMax: values.surfaceMax ? Number(values.surfaceMax) : undefined,
      page: 0,
    };
    setFilters(searchFilters);
    setHasSearched(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="search-container">
      <Card className="search-card" title={<><SearchOutlined /> Search Real Estate</>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
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
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large" block>
              Search
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {!hasSearched && (
        <Card className="results-card">
          <Empty 
            description="Click the search button to find real estate ads"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {hasSearched && isLoading && (
        <Card className="results-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading results...</p>
          </div>
        </Card>
      )}

      {hasSearched && !isLoading && data && (
        <Card className="results-card" title={`${data.count} Results`}>
          {data.count === 0 ? (
            <Empty description="No ads found. Try adjusting your search criteria." />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={data.data}
              renderItem={(ad: Ad) => (
                <List.Item
                  key={ad._id}
                  extra={
                    ad.thumb_urls?.[0] && (
                      <img
                        width={200}
                        alt={ad.title}
                        src={ad.thumb_urls[0]}
                      />
                    )
                  }
                >
                  <List.Item.Meta
                    title={
                      <a href={ad.url} target="_blank" rel="noopener noreferrer">
                        {ad.title}
                      </a>
                    }
                    description={
                      <div>
                        <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                          {formatPrice(ad.price)}
                        </Text>
                        {ad.surface && <Text> • {ad.surface} m²</Text>}
                        {ad.rooms && <Text> • {ad.rooms} rooms</Text>}
                        <br />
                        <Text type="secondary">
                          {ad.location.city}, {ad.location.zipcode}
                        </Text>
                        <br />
                        <Text type="secondary">
                          {new Date(ad.release_date).toLocaleDateString()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default Search;
