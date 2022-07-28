import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, List, Typography } from 'antd';
import { useRequest, request } from '@umijs/max';
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
  const { data, run, loading } = useRequest(() => {
    return request<Record<string, any>>('/api/v1/projects');
  });

  const [updateVisible, setUpdateVisible] = useState(false);
  const [editing, setEditing] = useState({});

  const list = data?.list || [];

  const changeUpdate = (index: number) => {
    setEditing(list[index - 1]);
    setUpdateVisible(true);
  };

  const deleteItem = (seq: number) => {
    return request<Record<string, any>>(`/api/v1/project/${seq}`, {
      method: 'DELETE',
    }).then((res) => {
      message.success('删除成功');
      run();
    });
  };

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
          rowKey="seq"
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
          renderItem={(item, index) => {
            if (item && item.seq) {
              return (
                <List.Item key={item.seq}>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={[
                      <a
                        key="option1"
                        onClick={() => {
                          changeUpdate(index);
                        }}
                      >
                        修改
                      </a>,
                      <a key="option2" onClick={() => deleteItem(item.seq as number)}>
                        删除
                      </a>,
                    ]}
                  >
                    <Card.Meta
                      avatar={<img alt="" className={styles.cardAvatar} src={item.logo} />}
                      title={<a>{item.name}</a>}
                      description={
                        <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                          {item.desc}
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
                    const formData = new FormData();
                    formData.append('name', values.name);
                    formData.append('desc', values.desc || '');
                    formData.append('logo', values.logo[0]?.thumbUrl || '');
                    await request<Record<string, any>>('/api/v1/project/create', {
                      method: 'PUT',
                      data: formData,
                      requestType: 'form',
                    }).then((res) => {
                      console.log('res: ', res);
                      message.success('提交成功');
                    });
                    return true;
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
      <ModalForm
        width={480}
        modalProps={{ destroyOnClose: true }}
        visible={updateVisible}
        onVisibleChange={setUpdateVisible}
        initialValues={{ ...editing, logo: [{ thumbUrl: (editing as any).logo }] }}
        onFinish={async (values: any) => {
          const formData = new FormData();
          formData.append('name', values.name);
          formData.append('desc', values.desc || '');
          formData.append('logo', values.logo[0]?.thumbUrl || '');
          await request<Record<string, any>>(`/api/v1/project/${(editing as any).seq}`, {
            method: 'PUT',
            data: formData,
            requestType: 'form',
          }).then((res) => {
            console.log('res: ', res);
            message.success('提交成功');
          });
          run();
          return true;
        }}
      >
        <ProFormText
          width="md"
          name="name"
          label="项目名称"
          placeholder="请输入名称"
          rules={[{ required: true, message: 'Please input project name!' }]}
        />
        <ProFormTextArea width="md" name="desc" label="项目描述" placeholder="请输入描述" />
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
    </PageContainer>
  );
};

export default CardList;
