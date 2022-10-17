import { useState } from 'react';
import type { ReactText } from 'react';
import { PageContainer, ProList } from '@ant-design/pro-components';
import { Button, Image, Space, Row, Col, Typography } from 'antd';
const { Text } = Typography;
import './style.less';

const dataSource = [
  {
    id: 1,
    reference: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    test: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    diff: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    id: 2,
    reference: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    test: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    diff: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    id: 3,
    reference: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    test: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    diff: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    id: 4,
    reference: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    test: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
];
const Report = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<ReactText[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: ReactText[], selectedRows: any[]) => {
      if (selectedRows.some((item) => !item.diff)) return;
      setSelectedRowKeys(keys);
    },
  };

  const content = null;

  return (
    <PageContainer content={content}>
      <ProList<{ title: string }>
        toolBarRender={() => {
          return [
            (selectedRowKeys.length && (
              <Button key="3" type="primary">
                Approve Selected
              </Button>
            )) ||
              null,
          ];
        }}
        rowClassName={(row: any) => {
          return row.diff ? 'failed' : 'success';
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
            render: (src: string, record: any) => {
              return (
                <Row gutter={[16, 0]}>
                  <Col span={8}>
                    <Space direction="vertical" align="center">
                      <Text type="secondary">REFERENCE</Text>
                      <Image src={src} />
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" align="center">
                      <Text type="secondary">TEST</Text>
                      <Image src={record.test} />
                    </Space>
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
              return (
                (record.diff && (
                  <Button key="3" type="primary">
                    Approve
                  </Button>
                )) ||
                null
              );
            },
          },
        }}
        headerTitle="支持选中的列表"
        rowSelection={rowSelection}
        dataSource={dataSource}
      />
    </PageContainer>
  );
};

export default Report;
