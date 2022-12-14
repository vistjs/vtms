import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Form,
  Layout,
  message,
  Modal,
  Popconfirm,
  Descriptions,
  Select,
  Tooltip,
  Space,
} from 'antd';
import {
  ActionType,
  ProColumns,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormTextArea,
  ModalForm,
  PageContainer,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { useRequest, FormattedMessage, useParams, Link } from '@umijs/max';
import { getCases, getCategories, deleteCase, updateCase } from './service';
import { getProjects } from '@/pages/Project/List/service';
import { caseStatus, caseStatusText } from './constants';
import { CaseListItem, category } from './types';
import './index.less';
import CaseSteps from './components/Steps';
import CategoryTree from './components/CategoryTree';

const { Sider, Content } = Layout;

const handleCaseUpdate = async (fields: any) => {
  const hide = message.loading('Updating');
  try {
    await updateCase(fields.id, {
      name: fields.name,
      status: fields.status,
      categoryId: fields.category,
      noticeHook: fields.noticeHook,
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
  const currentCategoryId = useRef('');
  const [selectCategoryId, setSelectCategoryId] = useState('');
  const currentProjectId = useRef(query.projectId);
  const [categoryData, setCategoryData] = useState<category>();
  const actionRef = useRef<ActionType>();

  const { data: projects } = useRequest(getProjects);

  const projectsSelects =
    projects?.list?.map((item: any) => ({
      label: <Link to={`/project/${item.seq}/cases`}>{item.name}</Link>,
      value: item.seq,
    })) || [];

  const columns: ProColumns<CaseListItem>[] = [
    {
      title: '??????',
      key: 'name',
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              Modal.info({
                title: '??????steps',
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
      title: '????????????',
      key: 'runs',
      dataIndex: 'runs',
      search: false,
      hideInForm: true,
      renderText: (val: string) => val,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      key: 'status',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        [caseStatus.NOTACTIVE]: {
          text: caseStatusText[caseStatus.NOTACTIVE],
          status: 'Default',
        },
        [caseStatus.ACTIVE]: {
          text: caseStatusText[caseStatus.ACTIVE],
          status: 'Warning',
        },
        [caseStatus.RUNNING]: {
          text: caseStatusText[caseStatus.RUNNING],
          status: 'Processing',
        },
        [caseStatus.SUCCESS]: {
          text: caseStatusText[caseStatus.SUCCESS],
          status: 'Success',
        },
        [caseStatus.ERROR]: {
          text: caseStatusText[caseStatus.ERROR],
          status: 'Error',
        },
      },
    },
    {
      title: '??????????????????',
      sorter: true,
      key: 'lastRun',
      dataIndex: 'lastRun',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '????????????',
      sorter: true,
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '?????????',
      key: 'lastOperator',
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
      key: 'option',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a
            key="config"
            onClick={() => {
              caseFormRef.setFieldsValue({
                id: record._id,
                name: record.name,
                status: record.status,
                category: record.category,
                noticeHook: record.noticeHook,
              });
              handleUpdateModalVisible(true);
            }}
          >
            <FormattedMessage id="pages.searchTable.config" defaultMessage="Configuration" />
          </a>
          <Popconfirm
            placement="top"
            title="?????????????????????????"
            onConfirm={async () => {
              const success = await handleCaseDelete(record);
              if (success && actionRef.current) {
                actionRef.current.reload();
              }
            }}
            okText="???"
            cancelText="???"
          >
            <a key="delete">??????</a>
          </Popconfirm>
          <Link to={`/case/${record._id}/task`}>??????</Link>
        </Space>
      ),
    },
  ];

  const treeSelectHandle = useCallback(
    (selectedKeys, info) => {
      if (info.node.key !== currentCategoryId.current) {
        currentCategoryId.current = info.node.key || '';
        if (actionRef.current) {
          actionRef.current.reload();
        }
        setSelectCategoryId(currentCategoryId.current);
      }
    },
    [currentCategoryId],
  );

  const getCategoryTree = useCallback(() => {
    if (!query.projectId) return;
    getCategories(query.projectId as string)
      .then(({ data }) => {
        setCategoryData(data);
      })
      .catch((e) => {});
  }, [query.projectId]);

  useEffect(() => {
    if (!Number(query.projectId)) {
      return;
    }
    getCategoryTree();
    if (actionRef.current && currentProjectId.current !== query.projectId) {
      currentProjectId.current = query.projectId;
      actionRef.current.reload();
    }
  }, [getCategoryTree, currentProjectId]);

  return (
    <PageContainer
      content={
        <Descriptions column={3} style={{ marginBlockEnd: -16 }}>
          <Descriptions.Item label="??????">
            <Tooltip
              placement="right"
              title="??????????????????"
              color="red"
              visible={!Number(query.projectId)}
            >
              <Select
                showSearch
                options={projectsSelects}
                placeholder="Select a project"
                value={Number(query.projectId)}
              ></Select>
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="pid">{query.projectId}</Descriptions.Item>
          <Descriptions.Item label="cid">{selectCategoryId}</Descriptions.Item>
        </Descriptions>
      }
    >
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
            transform: 'rotateY(0deg)',
          }}
        >
          <p style={{ textAlign: 'center', margin: '4px 0', fontWeight: 'bold' }}>??????</p>
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
            headerTitle="????????????"
            actionRef={actionRef}
            rowKey="_id"
            search={{
              labelWidth: 120,
            }}
            request={async (params, option) => {
              try {
                if (!Number(query.projectId)) {
                  return { success: false };
                }
                const res = await getCases(
                  Object.assign({
                    projectId: query.projectId,
                    categoryId: currentCategoryId.current,
                    ...params,
                  }),
                  option,
                );
                return { data: res?.data?.list, total: res?.data?.total, success: true };
              } catch (error: any) {
                return { success: false };
              }
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
          label="??????"
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
          label="??????"
        />
        <ProFormTreeSelect
          name="category"
          label="??????"
          placeholder="Please select"
          allowClear
          secondary
          request={async () => {
            type selectNode = {
              value: string | number;
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
            autoClearSearchValue: true,
            multiple: false,
            treeNodeFilterProp: 'label',
          }}
        />
        <ProFormTextArea
          name="noticeHook"
          label="??????hook"
          placeholder="?????????curl"
          extra="??????????????????curl??????????????????postman????????? ??????????????????{case}???{isError}???{errorMsg}???{total}???{failed}???{passed}"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Cases;
