import {
  addRule,
  removeRule,
  rule,
  updateRule,
  getUsers,
  addUser,
  deleteUser,
} from '@/services/ant-design-pro/api';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';

const { confirm } = Modal;

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

interface InputAddUser extends Omit<Auth.AddUser, 'isAdmin'> {
  isAdmin: string[];
}

const handleAdd = async (fields: Auth.AddUser) => {
  const hide = message.loading('正在添加');
  console.log('fields:', fields);
  const { username, password, isAdmin } = fields;
  try {
    await addUser({ username, password, isAdmin });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

const postData = (data) => {
  console.log('data:', data);
  return data?.list;
};

const User: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const { initialState, setInitialState } = useModel('@@initialState');

  console.log('initialState in use list:', initialState);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<Auth.User>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      valueType: 'text',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      // valueType: (record) => {
      //   return 'ddd';
      // },
      render(_, record) {
        return record?.roles?.map((role) => role?.name).join(',');
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Button
          disabled={!record.isAdmin}
          onClick={() => {
            confirm({
              title: 'Are you sure delete this user?',
              icon: <ExclamationCircleOutlined />,
              content: '',
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              async onOk() {
                const success = await deleteUser({ username: record.username });
                if (success) {
                  handleModalVisible(false);
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              },
              onCancel() {
                console.log('Cancel');
              },
            });
          }}
          type="link"
        >
          Delete
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Auth.User, Auth.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={getUsers}
        postData={postData}
        columns={columns}
      />
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newRule',
          defaultMessage: 'New rule',
        })}
        width="400px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value: InputAddUser) => {
          const { username, password, isAdmin } = value;
          const success = await handleAdd({
            username,
            password,
            isAdmin: isAdmin?.length > 0 && isAdmin[0] === 'Yes',
          });
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.username"
                  defaultMessage="Username is required"
                />
              ),
            },
          ]}
          width="md"
          name="username"
          label="Username"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.password"
                  defaultMessage="Password is required"
                />
              ),
            },
          ]}
          width="md"
          name="password"
          label="Password"
        />
        <ProFormCheckbox.Group
          name="isAdmin"
          layout="vertical"
          label="Is Admin"
          options={['Yes']}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default User;
