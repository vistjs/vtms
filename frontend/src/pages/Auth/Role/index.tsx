import React, { useRef } from 'react';
import { getRoles } from '../service';
import { Role as RoleType, PageParams } from '../types';

import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';

const postData = (data) => {
  return data?.list;
};

const Role: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<RoleType>[] = [
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

  return (
    <PageContainer>
      <ProTable<RoleType, PageParams>
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        request={getRoles}
        postData={postData}
        columns={columns}
      />
    </PageContainer>
  );
};

export default Role;
