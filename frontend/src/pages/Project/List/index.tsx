import { useState, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, List, Typography, Row, Col, message, Avatar, Image, Input } from 'antd';
import { useRequest, Link, useAccess, Access } from '@umijs/max';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  PageContainer,
  ProFormSelect,
  ProForm,
  ProFormInstance,
} from '@ant-design/pro-components';
import { getProjects, getUsers, createProject, editProject, deleteProject } from './service';
import type { CardListItemDataType } from './types';
import { uuid2 } from '@/utils';
import styles from './style.less';

const { Paragraph } = Typography;

const CardList = () => {
  const access = useAccess();
  const createFormRef = useRef<ProFormInstance>();
  const updateFormRef = useRef<ProFormInstance>();
  const { data, run, loading } = useRequest(getProjects);

  const { data: users } = useRequest(getUsers);

  const usersSelects = Object.fromEntries(
    users?.list?.map((item: any) => [item._id, item.username]) || [],
  );

  const [updateVisible, setUpdateVisible] = useState(false);
  const [editing, setEditing] = useState({});

  const list = (data?.list || []).map((item: any) => {
    return {
      ...item,
      owners: item?.ownerRole?.users,
      members: item?.memberRole?.users,
    };
  });

  const changeUpdate = (index: number) => {
    setEditing(list[index - 1]);
    setUpdateVisible(true);
  };

  const deleteItem = (seq: number) => {
    return deleteProject(seq).then((res) => {
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
                      <Link to={`/project/${item.seq}/cases`}>详情</Link>,
                      <Access accessible={access.canEditProject(item.owners)} fallback={null}>
                        <a
                          key="option2"
                          onClick={() => {
                            changeUpdate(index);
                          }}
                        >
                          修改
                        </a>
                      </Access>,
                      <Access accessible={access.canAdmin} fallback={null}>
                        <a key="option3" onClick={() => deleteItem(item.seq as number)}>
                          删除
                        </a>
                      </Access>,
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        item.logo ? (
                          <Avatar
                            src={
                              <Image
                                src={item.logo}
                                style={{
                                  width: 48,
                                }}
                              />
                            }
                          />
                        ) : (
                          <Avatar size={48}>{item?.name?.slice(0, 1)}</Avatar>
                        )
                      }
                      title={item.name}
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
                  formRef={createFormRef}
                  trigger={
                    <Button
                      type="dashed"
                      className={styles.newButton}
                      disabled={!access.canAdmin}
                      title={access.canAdmin ? '' : '请联系管理员新建项目'}
                    >
                      <PlusOutlined /> 新增项目
                    </Button>
                  }
                  modalProps={{ destroyOnClose: true }}
                  onFinish={async (values: any) => {
                    const formData = new FormData();
                    formData.append('name', values.name);
                    formData.append('token', values.token);
                    formData.append('desc', values.desc || '');
                    formData.append('logo', (values.logo && values.logo[0]?.thumbUrl) || '');
                    formData.append('owners', (values.owners || []).join(','));
                    formData.append('members', (values.members || []).join(','));
                    try {
                      await createProject(formData as any).then((res) => {
                        message.success('创建成功');
                      });
                      run();
                      return true;
                    } catch (e) {
                      return false;
                    }
                  }}
                >
                  <ProFormText
                    width="md"
                    name="name"
                    label="项目名称"
                    placeholder="请输入名称"
                    rules={[{ required: true, message: 'Please input project name!' }]}
                  />
                  <ProForm.Item label="token" extra="Call open api need token to check auth.">
                    <Row gutter={8}>
                      <Col span={12}>
                        <ProForm.Item name="token" noStyle>
                          <Input disabled />
                        </ProForm.Item>
                      </Col>
                      <Col span={12}>
                        <Button
                          type="primary"
                          onClick={() => {
                            createFormRef.current?.setFields([{ name: 'token', value: uuid2(10) }]);
                          }}
                        >
                          gen token
                        </Button>
                      </Col>
                    </Row>
                  </ProForm.Item>
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
                  <ProFormSelect
                    name="owners"
                    label="管理员"
                    valueEnum={usersSelects}
                    fieldProps={{ showSearch: true, mode: 'multiple' }}
                    placeholder="Please select"
                  />
                  <ProFormSelect
                    name="members"
                    label="项目成员"
                    valueEnum={usersSelects}
                    fieldProps={{ showSearch: true, mode: 'multiple' }}
                    placeholder="Please select"
                  />
                </ModalForm>
              </List.Item>
            );
          }}
        />
      </div>
      <ModalForm
        width={480}
        formRef={updateFormRef}
        modalProps={{ destroyOnClose: true }}
        visible={updateVisible}
        onVisibleChange={setUpdateVisible}
        initialValues={{ ...editing, logo: [{ thumbUrl: (editing as any).logo }] }}
        onFinish={async (values: any) => {
          const formData = new FormData();
          formData.append('name', values.name);
          formData.append('token', values.token);
          formData.append('desc', values.desc || '');
          formData.append('logo', values.logo[0]?.thumbUrl || '');
          formData.append('owners', (values.owners || []).join(','));
          formData.append('members', (values.members || []).join(','));
          try {
            await editProject((editing as any).seq, formData as any).then((res) => {
              message.success('修改成功');
            });
            run();
            return true;
          } catch (e) {
            return false;
          }
        }}
      >
        <ProFormText
          width="md"
          name="name"
          label="项目名称"
          placeholder="请输入名称"
          rules={[{ required: true, message: 'Please input project name!' }]}
        />
        <ProForm.Item label="token" extra="Call open api need token to check auth.">
          <Row gutter={8}>
            <Col span={12}>
              <ProForm.Item name="token" noStyle>
                <Input disabled />
              </ProForm.Item>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                onClick={() => {
                  updateFormRef.current?.setFields([{ name: 'token', value: uuid2(10) }]);
                }}
              >
                gen token
              </Button>
            </Col>
          </Row>
        </ProForm.Item>
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
        <ProFormSelect
          name="owners"
          label="管理员"
          valueEnum={usersSelects}
          fieldProps={{ showSearch: true, mode: 'multiple' }}
          placeholder="Please select"
        />
        <ProFormSelect
          name="members"
          label="项目成员"
          valueEnum={usersSelects}
          fieldProps={{ showSearch: true, mode: 'multiple' }}
          placeholder="Please select"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default CardList;
