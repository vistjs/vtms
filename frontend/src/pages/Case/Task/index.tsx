import { useParams, useRequest, Link } from '@umijs/max';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import { Badge, Statistic, Popconfirm, Space } from 'antd';
import { CaseTask, Result } from './types';
import { getTasks, coverMaster } from './service';

const { Divider } = ProCard;

const TaskPage = () => {
  const query = useParams();

  const { data: caseTask, run: refresh } = useRequest<{ data: CaseTask }>(() => {
    return getTasks(query.caseId);
  });

  const content = null;

  const columns: ProColumns<Result>[] = [
    {
      dataIndex: 'branch',
      title: '分支',
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
      dataIndex: 'createdAt',
      title: '创建时间',
    },
    {
      dataIndex: 'updatedAt',
      title: '更新时间',
    },
    {
      title: '操作',
      dataIndex: 'x',
      valueType: 'option',
      render: (_, record) => {
        return (
          <Space>
            <Link to={`/case/${query.caseId}/report/${record.branch}`}>详情</Link>
            {record.branch !== 'master' && (
              <Popconfirm
                placement="top"
                title="确定覆盖master吗? 会导致基线截图变成此分支!"
                onConfirm={async () => {
                  try {
                    await coverMaster(query.caseId, record.branch);
                    refresh();
                    return true;
                  } catch (e: any) {
                    return false;
                  }
                }}
                okText="是"
                cancelText="否"
              >
                <a key="cover">覆盖master</a>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer header={{ onBack: () => window.history.back() }} content={content}>
      <div>
        <ProCard.Group title={caseTask?.case} direction="row">
          <ProCard style={{ borderRadius: 0, boxShadow: 'unset' }}>
            <Statistic title="全部" value={caseTask?.total} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard style={{ borderRadius: 0, boxShadow: 'unset' }}>
            <Statistic title="passed" value={caseTask?.passed} valueStyle={{ color: '#3f8600' }} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard style={{ borderRadius: 0, boxShadow: 'unset' }}>
            <Statistic title="failed" value={caseTask?.failed} valueStyle={{ color: '#cf1322' }} />
          </ProCard>
        </ProCard.Group>
      </div>
      <ProTable<Result>
        columns={columns}
        dataSource={caseTask?.results}
        rowKey="branch"
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
