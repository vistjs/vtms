import { useState } from 'react';
import type { ReactText } from 'react';
import { useParams, useRequest } from '@umijs/max';
import { PageContainer, ProList } from '@ant-design/pro-components';
import { Button, Image, Space, Row, Col, Typography } from 'antd';
const { Text } = Typography;
import './style.less';
import { usePromiseLoading } from '@/hooks';
import { getTask, approve, disapprove } from './service';
import type { Screenshot, Report } from './types';

const ReportPage = () => {
  const query = useParams();
  const { data: taskReport, run: refresh } = useRequest<{ data: Report }>(() => {
    return getTask(query.caseId, query.branch);
  });

  const { loading: approveLoading, run: runApprove } =
    usePromiseLoading<Parameters<typeof approve>>(approve);
  const { loading: approveSelectedLoading, run: runApproveSelected } =
    usePromiseLoading<Parameters<typeof approve>>(approve);

  const { loading: disapproveLoading, run: runDisapprove } =
    usePromiseLoading<Parameters<typeof disapprove>>(disapprove);

  const [selectedRowKeys, setSelectedRowKeys] = useState<ReactText[]>([]);
  const rowSelection = {
    selectedRowKeys: selectedRowKeys.filter(
      (id: any) => !(taskReport?.screenshots?.[id] && taskReport?.screenshots?.[id].passed),
    ),
    onChange: (keys: ReactText[], selectedRows: any[]) => {
      if (selectedRows.some((item) => !item.diff)) return;
      setSelectedRowKeys(keys);
    },
  };

  const content = null;

  return (
    <PageContainer header={{ onBack: () => window.history.back() }} content={content}>
      <ProList<Screenshot>
        headerTitle={`branch: ${query.branch}`}
        toolBarRender={() => {
          return [
            (rowSelection.selectedRowKeys.length && (
              <Button
                key="3"
                type="primary"
                loading={approveSelectedLoading}
                onClick={() =>
                  runApproveSelected(
                    rowSelection.selectedRowKeys as number[],
                    query.caseId,
                    query.branch,
                  ).then(refresh)
                }
              >
                Approve Selected
              </Button>
            )) ||
              null,
          ];
        }}
        rowClassName={(row: any) => {
          return row.diff && !row.passed ? 'failed' : 'passed';
        }}
        grid={{ column: 1 }}
        metas={{
          title: {
            render: (_1: any, _2: any, index: number) => {
              return `#${index + 1}`;
            },
          },
          content: {
            dataIndex: 'reference',
            render: (src: any, record: any) => {
              return (
                <Row gutter={[16, 0]}>
                  <Col span={8}>
                    <Space direction="vertical" align="center">
                      <Text type="secondary">REFERENCE</Text>
                      <Image src={src} />
                    </Space>
                  </Col>
                  <Col span={8}>
                    {record.test && (
                      <Space direction="vertical" align="center">
                        <Text type="secondary">TEST</Text>
                        <Image src={record.test} />
                      </Space>
                    )}
                  </Col>
                  <Col span={8}>
                    {record.diff && (
                      <Space direction="vertical" align="center">
                        <Text type="secondary">DIFF</Text>
                        <Image src={record.diff} />
                      </Space>
                    )}
                  </Col>
                </Row>
              );
            },
          },
          actions: {
            render: (_1: any, record: any) => {
              if (record.diff && !record.passed) {
                return (
                  <Button
                    key="3"
                    type="primary"
                    loading={approveLoading}
                    onClick={() =>
                      runApprove([record.id], query.caseId, query.branch).then(refresh)
                    }
                  >
                    Approve
                  </Button>
                );
              } else if (record.diff && record.passed) {
                return (
                  <Button
                    key="3"
                    type="primary"
                    danger
                    loading={disapproveLoading}
                    onClick={() =>
                      runDisapprove([record.id], query.caseId, query.branch).then(refresh)
                    }
                  >
                    Disapprove
                  </Button>
                );
              } else {
                return null;
              }
            },
          },
        }}
        rowSelection={rowSelection}
        dataSource={taskReport?.screenshots}
      />
    </PageContainer>
  );
};

export default ReportPage;
