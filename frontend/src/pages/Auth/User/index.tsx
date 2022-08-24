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
  ProFormSelect,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import { AddUser } from './user';

const { confirm } = Modal;

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const handleAdd = async (fields: AddUser) => {
  const hide = message.loading('正在添加');
  console.log('fields:', fields);
  const { username, password, roles } = fields;
  try {
    await addUser({ username, password, roles });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: any) => {
  const hide = message.loading('Configuring');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
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
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const { initialState, setInitialState } = useModel('@@initialState');

  console.log('initialState in use list:', initialState);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.User>[] = [
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
          onClick={() => {
            confirm({
              title: 'Are you sure delete this user?',
              icon: <ExclamationCircleOutlined />,
              content: '',
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              async onOk() {
                const success = await deleteUser({ id: record.id });
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
      <ProTable<API.User, API.PageParams>
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
        onFinish={async (value) => {
          console.log('value::', value);
          const { username, password } = value;
          let roles = value?.roles?.map((item) => item?.value);
          console.log('roles:', roles);
          const success = await handleAdd({
            username,
            password,
            roles,
          } as AddUser);
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
        <ProFormSelect.SearchSelect
          name="roles"
          label="Roles"
          fieldProps={{
            labelInValue: true,
            style: {
              minWidth: 140,
            },
          }}
          debounceTime={300}
          request={async ({ keyWords = '' }) => {
            return [{ value: '11', label: 'CRM Owner' }];
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default User;
