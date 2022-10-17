import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Layout, message, Modal, Popconfirm } from 'antd';
import {
  ActionType,
  ProColumns,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { ModalForm, PageContainer, ProFormText, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useParams } from '@umijs/max';
import { getCases, getCategories, deleteCase, updateCase } from './service';
import { CaseListItem, caseStatus, caseStatusText, category } from './constants';
import './index.less';
import CaseSteps from './components/Steps';
import CategoryTree from './components/CategoryTree';

const { Sider, Content } = Layout;

const handleCaseUpdate = async (fields: any) => {
  const hide = message.loading('Updating');
  console.log(fields);
  try {
    await updateCase({
      name: fields.name,
      status: fields.status,
      id: fields.id,
      categoryId: fields.category.value,
    });
    hide();

    message.success('Updated successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    return false;
  }
};

const handleCaseDelete = async (selectedRow: CaseListItem) => {
  const hide = message.loading('Deleting');
  try {
    await deleteCase(selectedRow._id);
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    return false;
  }
};

const Cases: React.FC = () => {
  const query = useParams();
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [caseFormRef] = Form.useForm();
  const selectCategoryId = useRef('');
  const [categoryData, setCategoryData] = useState<category>();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<CaseListItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              Modal.info({
                title: '用例信息',
                content: (
                  <div
                    style={{
                      maxHeight: '63vh',
                      overflow: 'auto',
                      paddingTop: '20px',
                    }}
                  >
                    <CaseSteps dataSource={entity.steps} />
                  </div>
                ),
              });
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '执行次数',
      dataIndex: 'runs',
      search: false,
      hideInForm: true,
      renderText: (val: string) => val,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        [caseStatus.NOTACTIVE]: {
          text: caseStatusText[caseStatus.NOTACTIVE],
          status: 'Default',
        },
        [caseStatus.ACTIVE]: {
          text: caseStatusText[caseStatus.ACTIVE],
          status: 'Success',
        },
        [caseStatus.RUNNING]: {
          text: caseStatusText[caseStatus.RUNNING],
          status: 'Processing',
        },
        [caseStatus.ERROR]: {
          text: caseStatusText[caseStatus.ERROR],
          status: 'Error',
        },
      },
    },
    {
      title: '上次执行时间',
      sorter: true,
      dataIndex: 'lastRun',
      search: false,
      valueType: 'dateTime',
      render: (dom) => dom,
    },
    {
      title: '更新时间',
      sorter: true,
      dataIndex: 'updateAt',
      search: false,
      valueType: 'dateTime',
      render: (dom) => dom,
    },
    {
      title: '更新人',
      dataIndex: 'lastOperator',
      search: false,
      render: (user: any) => {
        if (user && user.username) {
          return user.username;
        } else {
          return '-';
        }
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            caseFormRef.setFieldsValue({
              id: record._id,
              name: record.name,
              status: record.status,
              category: record.category,
            });
            handleUpdateModalVisible(true);
          }}
        >
          <FormattedMessage id="pages.searchTable.config" defaultMessage="Configuration" />
        </a>,
        <Popconfirm
          placement="top"
          title="确定删除该用例吗?"
          onConfirm={async () => {
            const success = await handleCaseDelete(record);
            if (success && actionRef.current) {
              actionRef.current.reload();
            }
          }}
          okText="是"
          cancelText="否"
        >
          <a key="delete">删除</a>
        </Popconfirm>,
      ],
    },
  ];

  const treeSelectHandle = useCallback(
    (selectedKeys, info) => {
      if (info.node.key !== selectCategoryId.current) {
        selectCategoryId.current = info.node.key || '';
        if (actionRef.current) {
          actionRef.current.reload();
        }
      }
    },
    [selectCategoryId],
  );

  const getCategoryTree = useCallback(() => {
    if (!query.projectId) return;
    getCategories(query.projectId as string).then(({ data }) => {
      setCategoryData(data);
    });
  }, [query.projectId]);

  useEffect(() => {
    getCategoryTree();
  }, [getCategoryTree]);

  return (
    <PageContainer>
      <Layout>
        <Sider
          width="240"
          collapsible
          collapsedWidth={20}
          theme="light"
          style={{
            backgroundColor: '#fff',
            marginRight: '16px',
            borderRadius: '6px',
            boxShadow:
              '0 2px 4px 0 rgb(0 0 0 / 5%), 0 1px 2px 0 rgb(25 15 15 / 7%), 0 0 1px 0 rgb(0 0 0 / 8%)',
            overflow: 'hidden',
          }}
        >
          {categoryData && (
            <CategoryTree
              onSelect={treeSelectHandle}
              dataSource={categoryData}
              onChange={getCategoryTree}
            />
          )}
        </Sider>
        <Content>
          <ProTable<CaseListItem>
            headerTitle="用例列表"
            actionRef={actionRef}
            rowKey="_id"
            search={{
              labelWidth: 120,
            }}
            request={async (params, option) => {
              const res = await getCases(
                Object.assign({
                  projectId: query.projectId,
                  categoryId: selectCategoryId.current,
                  ...params,
                }),
                option,
              );
              return { data: res?.data?.list, total: res?.data?.total, success: true };
            }}
            columns={columns}
          />
        </Content>
      </Layout>

      <ModalForm
        title="edit case"
        width="460px"
        form={caseFormRef}
        visible={updateModalVisible}
        onVisibleChange={handleUpdateModalVisible}
        onFinish={async (value) => {
          const success = await handleCaseUpdate(value);
          if (success) {
            handleUpdateModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText name="id" hidden />
        <ProFormText
          rules={[
            {
              required: true,
            },
          ]}
          name="name"
          label="名称"
        />
        <ProFormSelect
          options={[
            {
              value: caseStatus.NOTACTIVE,
              label: caseStatusText[caseStatus.NOTACTIVE],
            },
            {
              value: caseStatus.ACTIVE,
              label: caseStatusText[caseStatus.ACTIVE],
            },
          ]}
          width="lg"
          name="status"
          label="状态"
        />
        <ProFormTreeSelect
          name="category"
          label="目录"
          placeholder="Please select"
          allowClear
          secondary
          request={async () => {
            type selectNode = {
              value: string;
              label: string;
              children?: selectNode[];
            };
            const handleTree = (category: category) => {
              const { title, _id } = category;

              const node: selectNode = {
                value: _id,
                label: title,
              };
              if (category.children) {
                node.children = category.children.map((item) => handleTree(item));
              }
              return node;
            };
            return categoryData ? [handleTree(categoryData)] : [];
          }}
          // tree-select args
          fieldProps={{
            showArrow: false,
            filterTreeNode: true,
            showSearch: true,
            dropdownMatchSelectWidth: false,
            labelInValue: true,
            autoClearSearchValue: true,
            multiple: false,
            treeNodeFilterProp: 'label',
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Cases;
