import React from 'react';
import {Form, Row, Col, Input, Button} from 'antd';

export let SearchForm = (props) => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        props.onSearchClick(values.title, values.location);
    };

    return (
        <Form
            form={form}
            name="search"
            className="SearchForm"
            onFinish={onFinish}
        >
            <Row gutter={24}>
                <Col span={8} key={1}>
                    <Form.Item name="title" label="Title">
                        <Input placeholder="placeholder"/>
                    </Form.Item>
                </Col>
                <Col span={8} key={2}>
                    <Form.Item name="location" label="Location">
                        <Input placeholder="placeholder"/>
                    </Form.Item>
                </Col>
            </Row>

            <Row>
                <Col
                    span={24}
                    style={{
                        textAlign: 'right',
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                    <Button
                        style={{
                            margin: '0 8px',
                        }}
                        onClick={() => {
                            form.resetFields();
                        }}
                    >
                        Clear
                    </Button>

                </Col>
            </Row>
        </Form>
    );
};