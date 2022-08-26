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
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, setUpdateModalVisible] = useState({
    visible: false,
    status: ModalStatus.Add,
  });
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();

  const [users, setUsers] = useState<Auth.User[]>([]);
  const [addUserId, setAddUserId] = useState<string>();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

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
    // {
    //   title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
    //   dataIndex: 'option',
    //   valueType: 'option',
    //   render: (_, record) => [
    //     <Button
    //       type="link"
    //       onClick={() => {
    //         setAddUserModalVisible(true);
    //       }}
    //     >
    //       增加用户
    //     </Button>,
    //     <Button
    //       type="link"
    //       danger
    //       onClick={() => {
    //         setDeleteUserModalVisible(true);
    //       }}
    //     >
    //       删除用户
    //     </Button>,
    //   ],
    // },
  ];

  const handleSearch = (newValue: string) => {
    if (newValue) {
      // fetch(newValue, setData);
    } else {
      // setData([]);
    }
  };

  // useEffect(() => {
  //   getUsersApi({}).then((users) => {
  //     console.log('users users in roles page:', users);
  //     if (users.data?.list?.length) {
  //       setUsers(users.data.list);
  //     }
  //     // setUsers(users)
  //   });
  // }, []);

  const options = users?.map((user) => <Option key={user.id}>{user.username}</Option>);

  // const onSearch = (value: string) => {
  //   console.log('search:', value);
  // };

  const onChange = (userId: string) => {
    console.log(`selected userId: ${userId}`);
    setAddUserId(userId);
  };

  return (
    <PageContainer>
      <ProTable<Auth.Role, Auth.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
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

      {/* <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer> */}
    </PageContainer>
  );
};

export default Role;
