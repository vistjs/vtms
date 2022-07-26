import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, List, Typography } from 'antd';
import { useRequest } from '@umijs/max';
import { queryFakeList } from '@/services/ant-design-pro/api';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  PageContainer,
} from '@ant-design/pro-components';
import { message } from 'antd';
import type { CardListItemDataType } from './data';
import styles from './style.less';

const { Paragraph } = Typography;

const CardList = () => {
  const { data, loading } = useRequest(() => {
    return queryFakeList({
      count: 8,
    });
  });

  const list = data?.list || [];

  const content = null;

  const extraContent = (
    <div className={styles.extraImg}>
      <img
        alt="这是一个标题"
        src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png"
      />
    </div>
  );
  const nullData: Partial<CardListItemDataType> = {};
  return (
    <PageContainer content={content} extraContent={extraContent}>
      <div className={styles.cardList}>
        <List<Partial<CardListItemDataType>>
          rowKey="id"
          loading={loading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={[nullData, ...list]}
          renderItem={(item) => {
            if (item && item.id) {
              return (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={[<a key="option1">修改</a>, <a key="option2">删除</a>]}
                  >
                    <Card.Meta
                      avatar={<img alt="" className={styles.cardAvatar} src={item.avatar} />}
                      title={<a>{item.title}</a>}
                      description={
                        <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                          {item.description}
                        </Paragraph>
                      }
                    />
                  </Card>
                </List.Item>
              );
            }
            return (
              <List.Item>
                <ModalForm
                  width={480}
                  trigger={
                    <Button type="dashed" className={styles.newButton}>
                      <PlusOutlined /> 新增项目
                    </Button>
                  }
                  modalProps={{ destroyOnClose: true }}
                  onFinish={async (values: any) => {
                    console.log(values);
                    message.success('提交成功');
                  }}
                  initialValues={{
                    name: '蚂蚁设计有限公司',
                    useMode: 'chapter',
                  }}
                >
                  <ProFormText
                    width="md"
                    name="name"
                    label="项目名称"
                    placeholder="请输入名称"
                    rules={[{ required: true, message: 'Please input project name!' }]}
                  />
                  <ProFormTextArea
                    width="md"
                    name="desc"
                    label="项目描述"
                    placeholder="请输入描述"
                  />
                  <ProFormUploadButton
                    name="logo"
                    label="logo"
                    max={1}
                    fieldProps={{
                      name: 'file',
                      listType: 'picture-card',
                    }}
                  />
                </ModalForm>
              </List.Item>
            );
          }}
        />
      </div>
    </PageContainer>
  );
};

export default CardList;
