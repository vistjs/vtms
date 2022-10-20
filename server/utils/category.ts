import Category from '@/models/category';

type categoryItem = Category & {
  _id: string;
  children?: Array<categoryItem>;
};

const copyCategory = (category: categoryItem) => ({
  _id: category._id,
  title: category.title,
  parent: category.parent,
  project: category.project,
  createAt: category.createAt,
  updateAt: category.updateAt,
});

export const handleTree = function (categories: categoryItem[]) {
  let root;
  let map: {
    [id: string]: categoryItem;
  } = {};
  const copyCategories = [];
  for (let i = 0, len = categories.length; i < len; i++) {
    const category = categories[i];
    map[category._id] = copyCategory(category);
    if (!category.parent) {
      root = map[category._id];
    }
    copyCategories.push(map[category._id]);
  }

  for (let i = 0, len = copyCategories.length; i < len; i++) {
    const category = copyCategories[i];
    const parentId = category.parent;
    if (parentId) {
      let parent = map[String(parentId)];
      if (!parent) {
      } else {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(category);
      }
    }
  }
  return root;
};

const getTreeById = function (
  categoryItem: categoryItem,
  id: string,
): categoryItem | undefined {
  if (categoryItem._id == id) {
    return categoryItem;
  }
  if (categoryItem.children) {
    const children = categoryItem.children;
    for (let i = 0; i < children.length; i++) {
      const item = getTreeById(children[i], id);
      if (item) {
        return item;
      }
    }
  }
};

const getTreeId = function (categoryItem: categoryItem, arr: string[] = []) {
  arr.push(categoryItem._id);
  if (categoryItem.children) {
    categoryItem.children.forEach((item) => getTreeId(item, arr));
  }
  return arr;
};

export async function getAllSubCategoryId(
  projectId: string,
  categoryId: string,
) {
  const categories = await Category.find<categoryItem>({
    project: projectId,
  });
  const categoryTree = handleTree(categories);
  if (categoryTree) {
    const selectItem = getTreeById(categoryTree, categoryId);
    if (selectItem) {
      return getTreeId(selectItem);
    }
  }
  return [];
}
