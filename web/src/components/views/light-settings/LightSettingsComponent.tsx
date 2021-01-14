import React from 'react';
import { Card, Col, Row, Tabs } from 'antd';

type Props = {

};

type Channel = {
    name: string
}


function ChannelSettings(props: {channel: Channel}) {
    return (
        <Card bordered={false}>
        <Row>
            <Col md={6}>
            Hello world {props.channel.name}
            </Col>
        </Row>  
        </Card>
    );
}

export function LigthSettingsComponent(props: Props) {
    const channels = [
        {
            name: 'chn1',
        },
        {
            name: 'chn2',
        }
    ];
    
    return  (
      <Tabs defaultActiveKey="0" tabPosition={"left"} style={{ height: 220 }}>
        {channels.map((channel, i) => (
            <Tabs.TabPane tab={channel.name} key={`${i}`}>
            <ChannelSettings channel={channel} />
          </Tabs.TabPane>
          ))}
      </Tabs>
     );
}