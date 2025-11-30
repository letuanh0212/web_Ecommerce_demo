// import React, { useEffect, useState, useCallback } from "react";
// import { Table, Button, Modal, Form, Input,  InputNumber,  notification, Popconfirm,} from "antd";
// import {getItemsByStoreApi,createItemApi,updateItemApi,deleteItemApi,} from "../../unti/api_seller.js";

// const StorePage = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);

//   const store = JSON.parse(localStorage.getItem("user"))?.store;
//   const storeId = store?.id;

//   const [form] = Form.useForm();


//   const fetchItems = useCallback(async () => {
//     if (!storeId) return;

//     setLoading(true);
//     try {
//       const res = await getItemsByStoreApi(storeId);
//       setItems(res || []);
//     } catch (err) {
//       console.error(err);
//       notification.error({ message: "Failed to fetch items" });
//     }
//     setLoading(false);
//   }, [storeId]);


//   useEffect(() => {
//     fetchItems();
//   }, [fetchItems]);

//   const openModal = (item = null) => {
//     setEditingItem(item);
//     form.resetFields();
//     if (item) form.setFieldsValue(item);
//     setModalVisible(true);
//   };

//   const handleSubmit = async (values) => {
//     try {
//       if (editingItem) {
//         await updateItemApi(editingItem.id, { ...values, store_id: storeId });
//         notification.success({ message: "Item updated" });
//       } else {
//         await createItemApi({ ...values, store_id: storeId });
//         notification.success({ message: "Item created" });
//       }
//       setModalVisible(false);
//       fetchItems(); 
//     } catch (err) {
//       console.error(err);
//       notification.error({ message: "Action failed" });
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteItemApi(id);
//       notification.success({ message: "Item deleted" });
//       fetchItems();
//     } catch (err) {
//       console.error(err);
//       notification.error({ message: "Delete failed" });
//     }
//   };

//   const columns = [
//     { title: "Name", dataIndex: "name", key: "name" },
//     { title: "Price", dataIndex: "price", key: "price" },
//     { title: "Stock", dataIndex: "stock", key: "stock" },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <div style={{ display: "flex", gap: 8 }}>
//           <Button onClick={() => openModal(record)}>Edit</Button>
//           <Popconfirm
//             title="Are you sure delete this item?"
//             onConfirm={() => handleDelete(record.id)}
//           >
//             <Button danger>Delete</Button>
//           </Popconfirm>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 20 }}>
//       <Button
//         type="primary"
//         style={{ marginBottom: 16 }}
//         onClick={() => openModal()}
//       >
//         Add Item
//       </Button>

//       <Table
//         dataSource={items}
//         columns={columns}
//         rowKey="id"
//         loading={loading}
//       />

//       <Modal
//         title={editingItem ? "Edit Item" : "Add Item"}
//         open={modalVisible}
//         onCancel={() => setModalVisible(false)}
//         footer={null}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSubmit}>
//           <Form.Item
//             label="Name"
//             name="name"
//             rules={[{ required: true, message: "Please input item name!" }]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item
//             label="Price"
//             name="price"
//             rules={[{ required: true, message: "Please input price!" }]}
//           >
//             <InputNumber min={0} style={{ width: "100%" }} />
//           </Form.Item>

//           <Form.Item
//             label="Stock"
//             name="stock"
//             rules={[{ required: true, message: "Please input stock!" }]}
//           >
//             <InputNumber min={0} style={{ width: "100%" }} />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
//               {editingItem ? "Update" : "Create"}
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default StorePage;


import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  notification,
  Popconfirm,
  Select,
} from "antd";

// import {
//   getCategoriesByStoreApi,
//   createCategoryApi,
//   updateCategoryApi,
//   deleteCategoryApi,
// } from "../../unti/api_seller.js";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const store = JSON.parse(localStorage.getItem("user"))?.store;
  const storeId = store?.id;

  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    try {
      const res = await getCategoriesByStoreApi(storeId);
      setCategories(res || []);
    } catch (err) {
      console.error(err);
      notification.error({ message: "Failed to fetch categories" });
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openModal = (category = null) => {
    setEditingCategory(category);
    form.resetFields();
    if (category) form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, {
          ...values,
          store_id: storeId,
        });
        notification.success({ message: "Category updated" });
      } else {
        await createCategoryApi({ ...values, store_id: storeId });
        notification.success({ message: "Category created" });
      }

      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      notification.error({ message: "Action failed" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategoryApi(id);
      notification.success({ message: "Category deleted" });
      fetchCategories();
    } catch (err) {
      console.error(err);
      notification.error({ message: "Delete failed" });
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Image", dataIndex: "image", key: "image" },
    { title: "Parent", dataIndex: "parent_id", key: "parent_id" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => openModal(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this category?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => openModal()}
      >
        Add Category
      </Button>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input category name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Image URL" name="image">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="Parent Category" name="parent_id">
            <Select allowClear placeholder="Select parent category">
              {categories.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              {editingCategory ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryPage;
