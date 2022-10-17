import { getRoles, addRole, getUsersApi } from '../service';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Drawer, message, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const { Option } = Select;

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: Auth.Role) => {
  const hide = message.loading('正在添加');
  try {
    await addRole({ ...fields });
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

enum ModalStatus {
  Add = 1,
  Delete,
}

const Role: React.FC = () => {
  const [updateModalVisible, setUpdateModalVisible] = useState({
    visible: false,
    status: ModalStatus.Add,
  });
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false);

  const actionRef = useRef<ActionType>();

  const [users, setUsers] = useState<Auth.User[]>([]);
  const [addUserId, setAddUserId] = useState<string>();

  const columns: ProColumns<Auth.Role>[] = [
    {
      title: '角色',
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleDesc" defaultMessage="Description" />,
      dataIndex: 'desc',
      valueType: 'textarea',
    },
  ];

  const options = users?.map((user) => <Option key={user.id}>{user.username}</Option>);

  const onChange = (userId: string) => {
    console.log(`selected userId: ${userId}`);
    setAddUserId(userId);
  };

  return (
    <PageContainer>
      <ProTable<Auth.Role, Auth.PageParams>
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        request={getRoles}
        postData={postData}
        columns={columns}
      />
      <ModalForm
        title="Add User"
        width="400px"
        visible={addUserModalVisible}
        onVisibleChange={(visible) => {
          setAddUserModalVisible(visible);
        }}
        onFinish={async (value) => {
          const success = await handleAdd(value as Auth.Role);
          if (success) {
            setUpdateModalVisible({ visible: false, status: updateModalVisible.status });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <Select
          style={{ width: 200 }}
          showSearch
          allowClear
          placeholder="Select a user"
          optionFilterProp="children"
          onChange={onChange}
          // onSearch={onSearch}
          filterOption={(input, option) => {
            return (option!.children as unknown as string)
              .toLowerCase()
              .includes(input.toLowerCase());
          }}
        >
          {options}
        </Select>
      </ModalForm>

      <ModalForm
        title="Delete User"
        width="400px"
        visible={deleteUserModalVisible}
        onVisibleChange={(visible) => {
          setDeleteUserModalVisible(visible);
        }}
        onFinish={async (value) => {
          const success = await handleAdd(value as Auth.Role);
          if (success) {
            setUpdateModalVisible({ visible: false, status: updateModalVisible.status });
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
                  id="pages.searchTable.ruleName"
                  defaultMessage="Rule name is required"
                />
              ),
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>
    </PageContainer>
  );
};

export default Role;
