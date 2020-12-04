import React from 'react';
import {Form, Row, Col, Radio, InputNumber, Select, Input, Button} from 'antd';
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

    function onRadioClick(e) {
        if (e.target.checked) {
            form.setFieldsValue({sellType: null});
        }
    }

    const onFinish = (values) => {
        console.log(values); //TODO Remove with domain name
        props.onSearchClick(values);
    };

    return (
        <Form form={form} name="search" className="SearchForm" onFinish={onFinish}>
            <Row gutter={24}>
                <Form.Item name="type" label="Type">
                    <Select style={{width: 130}}>
                        <Select.Option value="home">Maison</Select.Option>
                        <Select.Option value="flat">Appartement</Select.Option>
                        <Select.Option value="building">Immeuble</Select.Option>
                        <Select.Option value="land">Terrain</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="sellType">
                    <Radio.Group>
                        <Radio.Button value="new" onClick={onRadioClick}>Neuf</Radio.Button>
                        <Radio.Button value="old" onClick={onRadioClick}>Ancien</Radio.Button>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name="priceMin" label="Prix">
                    <InputNumber placeholder="min" autoComplete="off" type="number"/>
                </Form.Item>
                <Form.Item name="priceMax">
                    <InputNumber placeholder="max" autoComplete="off" type="number"/>
                </Form.Item>

                <Form.Item name="surfaceMin" label="Surface">
                    <InputNumber placeholder="min" autoComplete="off" type="number"/>
                </Form.Item>
                <Form.Item name="surfaceMax">
                    <InputNumber placeholder="max" autoComplete="off" type="number"/>
                </Form.Item>
                <Form.Item name="title" label="Mots-clés">
                    <Input placeholder="Ensoleillé, balcon, etc..." autoComplete="off"/>
                </Form.Item>
                <Form.Item name="location" label="Localisation">
                    <GeoSuggest country="fr" autoActivateFirstSuggest="true"
                                placeholder="Ville, département, région..."
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
            </Row>

            <Row>
                <Col span={8} key={2}>

                </Col>
                <Col span={24} style={{textAlign: 'right',}}>
                    <Button type="primary" htmlType="submit">Rechercher</Button>
                    <Button style={{margin: '0 8px',}} onClick={() => form.resetFields()}>Effacer</Button>
                </Col>
            </Row>
        </Form>
    );
};