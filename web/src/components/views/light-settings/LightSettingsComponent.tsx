import React from 'react';
import { Card, Col, Row, Tabs } from 'antd';
import { Graph } from '../../ui/Graph';

type Props = {

};

type Channel = {
    name: string
}


function ChannelSettings(props: {channel: Channel}) {
    return (
        <Card bordered={false}>
            Hello world {props.channel.name}
            <Graph />
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
      <Tabs defaultActiveKey="0" tabPosition={"left"}>
        {channels.map((channel, i) => (
            <Tabs.TabPane tab={channel.name} key={`${i}`}>
            <ChannelSettings channel={channel} />
          </Tabs.TabPane>
          ))}
      </Tabs>
     );
}