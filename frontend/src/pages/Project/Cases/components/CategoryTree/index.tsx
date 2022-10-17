import React, { useCallback, useState, useMemo } from 'react';
import { Form, message, Tooltip, Tree } from 'antd';
import type { DirectoryTreeProps, DataNode } from 'antd/es/tree';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { category } from '../../constants';
import { addCategory, deleteCategory, updateCategory } from '../../service';
import { ModalForm, ProFormText } from '@ant-design/pro-components';

const { DirectoryTree } = Tree;

const maxTitleLen = 13; // 超出需要用tooltip

enum categoryFormStatus {
  HIDE,
  ADD,
  EDIT,
}

type categoryTreeNode = DataNode & {
  label: string;
};

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[] ? ElementType : never;

type IProps = {
  onSelect: DirectoryTreeProps['onSelect'];
  onChange: Function;
  dataSource: category;
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
    return false;
  }
};

export default function CategoryTree(props: IProps): JSX.Element {
  const [categoryFormRef] = Form.useForm();

  const [categoryModalVisible, handleCategoryModalStatus] = useState<number>(
    categoryFormStatus.HIDE,
  );

  const handleCategory: React.MouseEventHandler<HTMLSpanElement> = useCallback(async (e) => {
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
        const success = await handleCategoryDelete(id);
        if (success) {
          // getCategoryTree(query.projectId as string);
          props.onChange();
        }
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

  const handleTree = useCallback(
    (category: category, n = 0) => {
      const { title, _id } = category;
      const node: categoryTreeNode = {
        key: _id,
        label: title,
        title: (
          <>
            <span className="tree-title-text">
              {title.length > maxTitleLen - n * 2 ? (
                <Tooltip placement="topLeft" title={title}>
                  {title}
                </Tooltip>
              ) : (
                title
              )}
            </span>
            <span className="tree-title-options" data-id={category._id} onClick={handleCategory}>
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
    },
    [handleCategory],
  );

  const treeData = useMemo(() => [handleTree(props.dataSource)], [props.dataSource]);

  return (
    <>
      <DirectoryTree
        className="case-tree"
        onSelect={props.onSelect}
        treeData={treeData}
        defaultExpandedKeys={[treeData[0]?.key]}
        defaultSelectedKeys={[treeData[0]?.key]}
      />
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
            let success;
            if (categoryModalVisible === categoryFormStatus.EDIT) {
              success = await handleCategoryUpdate(value.title, value.id);
            } else {
              success = await handleCategoryAdd(value.title, value.id);
            }
            if (success) {
              props.onChange();
            }
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
    </>
  );
}
