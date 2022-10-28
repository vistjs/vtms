import { getUsersApi, addUser, deleteUser, updateUser } from '../service';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProTable,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { FormattedMessage, useModel } from '@umijs/max';
import { Button, message, Modal, Form } from 'antd';
import React, { useRef, useState } from 'react';
import { User, AddUser, PageParams } from './types';

const { confirm } = Modal;

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

interface InputAddUser extends Omit<AddUser, 'isAdmin'> {
  isAdmin: string[];
}

const postData = (data) => {
  return data?.list;
};

const PasswordReg = /^[\w-!?$%@*&]{5,}$/;

const User: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const [form] = Form.useForm();

  const handleAdd = async (fields: AddUser) => {
    const hide = message.loading('正在添加');
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

  const handleUpdate = async (fields: AddUser) => {
    const hide = message.loading('正在更新');
    const { username, isAdmin, password } = fields;
    try {
      await updateUser({ username, isAdmin, password: password.trim() });
      hide();
      message.success('Updated successfully');
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const columns: ProColumns<User>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      valueType: 'text',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      render(_, record) {
        return record?.roles?.map((role) => role?.name).join(',');
      },
    },
    {
      title: '是否Admin',
      dataIndex: 'isAdmin',
      search: false,
      render(_, record) {
        return record?.isAdmin ? 'Yes' : 'No';
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      width: 300,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key={'delete'}
          disabled={!initialState?.currentUser?.isAdmin}
          onClick={() => {
            confirm({
              title: 'Are you sure delete this user?',
              icon: <ExclamationCircleOutlined />,
              content: '',
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              async onOk() {
                try {
                  const success = await deleteUser({ username: record.username });
                  if (success) {
                    setCreateModalVisible(false);
                    if (actionRef.current) {
                      actionRef.current.reload();
                    }
                  }
                  return true;
                } catch (error) {
                  return false;
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
        <Button
          key={'update'}
          disabled={!initialState?.currentUser?.isAdmin}
          onClick={() => {
            setUpdateModalVisible(true);
            const { username, isAdmin } = record;
            form.setFields([
              { name: 'username', value: username },
              { name: 'isAdmin', value: isAdmin ? 'Yes' : '' },
            ]);
          }}
          type="link"
        >
          Update
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<User, PageParams>
        actionRef={actionRef}
        rowKey="username"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            disabled={!initialState?.currentUser?.isAdmin}
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={getUsersApi}
        postData={postData}
        columns={columns}
      />
      <ModalForm
        title="Add New User"
        width="400px"
        visible={createModalVisible}
        onVisibleChange={setCreateModalVisible}
        onFinish={async (value: InputAddUser) => {
          const { username, password, isAdmin } = value;
          const success = await handleAdd({
            username,
            password,
            isAdmin: isAdmin?.length > 0 && isAdmin[0] === 'Yes',
          });
          if (success) {
            setCreateModalVisible(false);
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
            {
              pattern: PasswordReg,
              message: 'Only support number, word, and -!?$%@*&, at least 5 words.',
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
      <ModalForm
        form={form}
        title="Update User"
        width="400px"
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        onFinish={async (value: InputAddUser) => {
          const { username, password, isAdmin } = value;
          const success = await handleUpdate({
            username,
            password,
            isAdmin: isAdmin?.length > 0 && isAdmin[0] === 'Yes',
          });
          if (success) {
            setUpdateModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText width="md" name="username" label="Username" disabled />
        <ProFormText
          rules={[
            {
              pattern: PasswordReg,
              message: 'Only support number, word, and -!?$%@*&, at least 5 words.',
            },
          ]}
          width="md"
          name="password"
          label="New Password"
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
