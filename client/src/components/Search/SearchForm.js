import React from 'react';
import {Form, Row, Col, Input, Button} from 'antd';
import GeoSuggest from 'react-geosuggest';

export let SearchForm = (props) => {

    const [form] = Form.useForm();

    const onSuggestSelect = suggest => {
        if (suggest) {
            form.setFieldsValue({
                location: {
                    address_components: suggest.gmaps.address_components,
                    coordinates: [suggest.location.lng, suggest.location.lat]
                }
            });
        }
    }

    function getSuggestLabel(suggest) {
        return suggest.description.replace(", France", "");
    }

    const onFinish = (values) => {
        props.onSearchClick(values);
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
                        <Input placeholder="placeholder" autoComplete="off"/>
                    </Form.Item>
                </Col>
                <Col span={8} key={2}>
                    <Form.Item name="location" label="Location">
                        <GeoSuggest country="fr" autoActivateFirstSuggest="true" autoComplete="off"
                                    inputClassName="ant-input"
                                    suggestItemClassName="ant-select-item"
                                    suggestItemActiveClassName="ant-select-item-option-active"
                                    suggestsHiddenClassName="ant-select-dropdown-hidden"
                                    suggestsClassName="ant-select-dropdown "
                                    style={{suggests: {minWidth: "200px", left: "0px", top: "2rem", padding: "0px"}}}
                                    types={["geocode"]}
                                    onSuggestSelect={onSuggestSelect}
                                    getSuggestLabel={getSuggestLabel}/>
                    </Form.Item>
                </Col>
            </Row>

            <Row>
                <Col span={24} style={{textAlign: 'right',}}>
                    <Button type="primary" htmlType="submit">Search</Button>
                    <Button style={{margin: '0 8px',}} onClick={() => {
                        form.resetFields();
                    }}>Clear</Button>
                </Col>
            </Row>
        </Form>
    );
};