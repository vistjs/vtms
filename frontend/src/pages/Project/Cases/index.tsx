import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Layout, message, Modal, Steps, Tooltip, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import moment from 'moment';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { ModalForm, PageContainer, ProFormText, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useParams } from '@umijs/max';
import {
  addCategory,
  deleteCategory,
  getCases,
  getCategories,
  deleteCase,
  updateCase,
  updateCategory,
} from './service';
import { CaseListItem, caseStatus, caseStatusText, category, RecordType } from './constants';
import './index.less';

const { Sider, Content } = Layout;
const { DirectoryTree } = Tree;
const { Step } = Steps;

enum categoryFormStatus {
  HIDE,
  ADD,
  EDIT,
}

type categoryTreeNode = DataNode & {
  label: string;
};

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
    message.error(error.response?.data?.error || 'Updated failed, please try again');
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
    message.error(error.response?.data?.error || 'Delete failed, please try again');
    return false;
  }
};

const handleCategoryUpdate = async (title: string, id: string) => {
  const hide = message.loading('Updating');
  try {
    await updateCategory(title, id);
    hide();
    message.success('Updated successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    message.error(error.response?.data?.error || 'Updated failed, please try again');
    return false;
  }
};

const handleCategoryAdd = async (title: string, parentId: string) => {
  const hide = message.loading('adding');
  try {
    await addCategory(title, parentId);
    hide();
    message.success('add successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    message.error(error.response?.data?.error || 'add failed, please try again');
    return false;
  }
};

const handleCategoryDelete = async (categoryId: string) => {
  const hide = message.loading('deleting');
  try {
    await deleteCategory(categoryId);
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    message.error(error.response?.data?.error || 'Delete failed, please try again');
    return false;
  }
};

const Cases: React.FC = () => {
  const query = useParams();
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [categoryModalVisible, handleCategoryModalStatus] = useState<number>(
    categoryFormStatus.HIDE,
  );
  const [caseFormRef] = Form.useForm();
  const [categoryFormRef] = Form.useForm();
  const selectCategoryId = useRef('');
  const [categoryTree, setCategoryTree] = useState<Array<categoryTreeNode>>([]);
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
                    <Steps direction="vertical">
                      {entity.frames.map((item: any, index: string) => {
                        let title;
                        let subInfo;
                        if (item.type === RecordType.MOUSE) {
                          title = item.data.type;
                        } else if (item.type === RecordType.INPUT) {
                          title = RecordType[item.type].toLowerCase();
                          subInfo = item.data.text;
                        } else {
                          title = RecordType[item.type].toLowerCase();
                        }
                        return (
                          <Step
                            status="process"
                            key={index}
                            title={title}
                            description={
                              <>
                                {subInfo && (
                                  <div
                                    style={{
                                      color: 'rgba(0, 0, 0, 0.45)',
                                    }}
                                  >
                                    {subInfo}
                                  </div>
                                )}
                                <div>{moment(item.time).format('YYYY-MM-DD hh:mm:ss')}</div>
                              </>
                            }
                          />
                        );
                      })}
                    </Steps>
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
        if (user && user.name) {
          return user.name;
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
        <a
          key="delete"
          onClick={() => {
            handleCaseDelete(record);
          }}
        >
          删除
        </a>,
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

  const getCategoryTree = useCallback((projectId: string) => {
    getCategories(projectId).then(({ data }) => {
      const maxLen = 13; // 超出需要用tooltip
      const handleTree = (category: category, n = 0) => {
        const { title, _id } = category;
        const node: categoryTreeNode = {
          key: _id,
          label: title,
          title: (
            <>
              <span className="tree-title-text">
                {title.length > maxLen - n * 2 ? (
                  <Tooltip placement="topLeft" title={title}>
                    {title}
                  </Tooltip>
                ) : (
                  title
                )}
              </span>
              <span
                className="tree-title-options"
                data-id={category._id}
                onClick={handleAddCategory}
              >
                {n < 4 && <PlusOutlined />}
                {n > 0 && (
                  <>
                    <EditOutlined />
                    <DeleteOutlined />
                  </>
                )}
              </span>
            </>
          ),
        };
        if (category.children) {
          node.children = category.children.map((item) => handleTree(item, n + 1));
        } else {
          node.isLeaf = true;
        }
        return node;
      };
      setCategoryTree([handleTree(data)]);
    });
  }, []);

  const handleAddCategory: React.MouseEventHandler<HTMLSpanElement> = useCallback(async (e) => {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    let target = e.target as HTMLSpanElement;
    let type;
    while (!type && target) {
      const icon = target?.dataset?.icon;
      if (icon) {
        type = icon;
      }
      target = target.parentNode as HTMLSpanElement;
    }
    if (!id) {
      return;
    }
    switch (type) {
      case 'delete':
        await handleCategoryDelete(id);
        getCategoryTree(query.projectId as string);
        break;
      case 'edit':
        handleCategoryModalStatus(categoryFormStatus.EDIT);
        const title = e.currentTarget.parentNode?.children[0].textContent;
        categoryFormRef.setFieldsValue({
          id,
          title,
        });
        break;
      case 'plus':
        handleCategoryModalStatus(categoryFormStatus.ADD);
        categoryFormRef.setFieldsValue({
          title: '',
          id,
        });
        break;
    }
  }, []);

  useEffect(() => {
    if (query.projectId) {
      getCategoryTree(query.projectId);
    }
  }, []);

  return (
    <PageContainer>
      <Layout>
        <Sider
          width="240"
          style={{
            backgroundColor: '#fff',
            marginRight: '16px',
            borderRadius: '6px',
            boxShadow:
              '0 2px 4px 0 rgb(0 0 0 / 5%), 0 1px 2px 0 rgb(25 15 15 / 7%), 0 0 1px 0 rgb(0 0 0 / 8%)',
            overflow: 'hidden',
          }}
        >
          {categoryTree.length > 0 && (
            <DirectoryTree
              className="case-tree"
              onSelect={treeSelectHandle}
              treeData={categoryTree}
              defaultExpandedKeys={[categoryTree[0]?.key]}
              defaultSelectedKeys={[categoryTree[0]?.key]}
            />
          )}
        </Sider>
        <Content>
          <ProTable<CaseListItem>
            headerTitle="case list"
            actionRef={actionRef}
            rowKey="_id"
            search={{
              labelWidth: 120,
            }}
            request={async (params, option) => {
              const data = await getCases(
                Object.assign({
                  projectId: query.projectId,
                  categoryId: selectCategoryId.current,
                  ...params,
                }),
                option,
              );
              return data;
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
            const handleTree = (category: categoryTreeNode) => {
              const node: selectNode = {
                value: category.key as string,
                label: category.label,
              };

              if (category.children) {
                node.children = category.children.map((item: any) => handleTree(item));
              }
              return node;
            };
            return [handleTree(categoryTree[0])];
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

      <ModalForm
        title={`${categoryModalVisible === categoryFormStatus.EDIT ? 'Edit' : 'New'} Category`}
        width="460px"
        form={categoryFormRef}
        visible={categoryModalVisible !== categoryFormStatus.HIDE}
        onVisibleChange={(value) => {
          if (!value) {
            handleCategoryModalStatus(categoryFormStatus.HIDE);
          }
        }}
        onFinish={async (value) => {
          try {
            if (categoryModalVisible === categoryFormStatus.EDIT) {
              await handleCategoryUpdate(value.title, value.id);
            } else {
              await handleCategoryAdd(value.title, value.id);
            }
            getCategoryTree(query.projectId as string);
          } catch (e) {
            console.log(e);
          }
          handleCategoryModalStatus(categoryFormStatus.HIDE);
        }}
      >
        <ProFormText name="id" hidden />
        <ProFormText
          rules={[
            {
              required: true,
            },
          ]}
          name="title"
          label="名称"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Cases;
