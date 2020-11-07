import React, {useState} from 'react';
import {Form, Row, Col, Input, Button} from 'antd';

export let SearchForm = (props) => {
    const [expand, setExpand] = useState(false);
    const [form] = Form.useForm();

    const getFields = () => {
        const count = expand ? 10 : 6;
        const children = [];

        for (let i = 0; i < count; i++) {
            children.push(
                <Col span={8} key={i}>
                    <Form.Item
                        name={`field-${i}`}
                        label={`Field ${i}`}
                    >
                        <Input placeholder="placeholder"/>
                    </Form.Item>
                </Col>,
            );
        }

        return children;
    };

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