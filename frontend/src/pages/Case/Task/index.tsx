import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest, request, Link, useAccess, Access } from '@umijs/max';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  PageContainer,
  ProFormSelect,
  ProCard,
  ProTable,
} from '@ant-design/pro-components';
import { Typography, message, Avatar, Badge, Statistic } from 'antd';
import type { CardListItemDataType } from './data';

const { Divider } = ProCard;

const { Paragraph } = Typography;

export type Task = {
  name: string;
  total: number;
  passed: number;
  failed: number;
};

const TaskPage = () => {
  const access = useAccess();

  const { data, run, loading } = useRequest(() => {
    return request<Record<string, any>>('/api/v1/projects');
  });

  const { data: users } = useRequest(() => {
    return request<Record<string, any>>('/api/v1/user/all');
  });

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
    return request<Record<string, any>>(`/api/v1/project/${seq}`, {
      method: 'DELETE',
    }).then((res) => {
      message.success('删除成功');
      run();
    });
  };

  const content = null;

  const nullData: Partial<CardListItemDataType> = {};

  const tableListDataSource: Task[] = [
    {
      name: '12ccs',
      total: 13,
      passed: 5,
      failed: 8,
    },
    {
      name: '345555',
      total: 13,
      passed: 5,
      failed: 8,
    },
    {
      name: 'rrr111',
      total: 13,
      passed: 5,
      failed: 8,
    },
  ];

  const columns: ProColumns<Task>[] = [
    {
      dataIndex: 'name',
      title: '名称',
      width: 150,
    },
    {
      dataIndex: 'total',
      title: '全部',
    },
    {
      dataIndex: 'passed',
      title: 'passed',
      render: (text: any) => {
        return <Badge color="#3f8600" text={text} />;
      },
    },
    {
      dataIndex: 'failed',
      title: 'failed',
      render: (text: any) => {
        return <Badge color="#cf1322" text={text} />;
      },
    },
    {
      title: '操作',
      dataIndex: 'x',
      valueType: 'option',
      render: (_, record) => {
        return [<a key="edit">详情</a>, <a key="edit">approve</a>];
      },
    },
  ];

  return (
    <PageContainer content={content}>
      <div>
        <ProCard.Group title="测试用例1" direction="row">
          <ProCard style={{ borderRadius: 0, boxShadow: 'unset' }}>
            <Statistic title="全部" value={10} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard style={{ borderRadius: 0, boxShadow: 'unset' }}>
            <Statistic title="passed" value={8} valueStyle={{ color: '#3f8600' }} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard style={{ borderRadius: 0, boxShadow: 'unset' }}>
            <Statistic title="failed" value={2} valueStyle={{ color: '#cf1322' }} />
          </ProCard>
        </ProCard.Group>
      </div>
      <ProTable<Task>
        columns={columns}
        request={(params, sorter, filter) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          console.log(params, sorter, filter);
          return Promise.resolve({
            data: tableListDataSource,
            success: true,
          });
        }}
        rowKey="name"
        pagination={{
          showQuickJumper: true,
        }}
        toolBarRender={false}
        search={false}
      />
    </PageContainer>
  );
};

export default TaskPage;
