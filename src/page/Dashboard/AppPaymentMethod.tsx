import { Button, Modal, Input, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { MdPersonAdd } from 'react-icons/md';
import Notification from '../../components/Notification';
import axios from 'axios';
import SystemConst from '../../common/consts/system_const';
import UnauthorizedError from '../../common/exception/unauthorized_error';
import ErrorCommon from '../../common/Screens/ErrorCommon';
interface DataType {
    paymentMethodName: string;
    action: React.ReactNode;
}
const BASE_URL = `${SystemConst.DOMAIN}/PaymentMethods`;
const AppPaymentMethods = () => {
    const columns: ColumnsType<DataType> = [
        {
            title: 'Tên khoa',
            dataIndex: 'paymentMethodName',
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
        },
    ];
    const [dataPaymentMethods, setDataPaymentMethods] = useState<DataType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItemEdit, setSelectedItemEdit] = useState<{ id?: number; paymentMethodName: string } | null>(null);
    const [selectedItemDetele, setSelectedItemDelete] = useState<{ id?: number } | null>(null);

    //Xử lý Call APU Get Data
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        handleFetchData();
    }, []);
    const handleFetchData = () => {
        axios
            .get(`${BASE_URL}`)
            .then((response) => {
                const Api_Data_PaymentMethods = response.data;
                console.log('data: ', Api_Data_PaymentMethods);
                const newData: DataType[] = Api_Data_PaymentMethods.map(
                    (item: { id: number; paymentMethodName: any; }) => ({
                        paymentMethodName: item.paymentMethodName,
                        action: (
                            <>
                                <div className="flex gap-x-1">
                                    <button
                                        className="bg-green-400 px-3 py-2 rounded-lg hover:bg-green-600 hover:text-white"
                                        onClick={() => handleEdit(item)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="bg-red-500 px-3 py-2 rounded-lg hover:bg-red-700 hover:text-white"
                                        onClick={() => handleDelete(item)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </>
                        ),
                    }),
                );
                setDataPaymentMethods(newData);
            })
            .catch((error) => {
                const isError = UnauthorizedError.checkError(error);
                if (!isError) {
                    const content = 'Lỗi máy chủ';
                    const title = 'Lỗi';
                    ErrorCommon(title, content);
                }
            });
    };
    //Xử lý Call API Create
    const handleCreatePaymentMethods = () => {
        const data = { paymentMethodName: isValuePaymentMethods };

        console.log('Data: ', data);
        axios
            .post(`${BASE_URL}`, data)
            .then((response) => {
                handleFetchData();
                setIsValuePaymentMethods('');
                setOpenModal(false);
                handleClickSuccess();
                console.log('Data', response);
                // const data = response.data.respone_data;
            })
            .catch((error) => {
            });
    };
    //Xử lý Call API Update
    const handleUpdatePaymentMethods = () => {
        const data = {
            id: selectedItemEdit?.id,
            paymentMethodName: selectedItemEdit?.paymentMethodName,
        };

        axios
            .put(`${BASE_URL}/${data.id}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    // Other headers or authentication tokens if required
                },
            })
            .then((response) => {
                handleClickEditSuccess();
                handleFetchData();
            })
            .catch((error) => {
                // Handle errors (you might want to log or display an error message)
                console.error('Error during update:', error);
            });
    };

    //Xử lý Call API Delete
    const handleDeletePaymentMethods = () => {
        const dataDelete = selectedItemDetele?.id;

        axios
            .delete(`${BASE_URL}/${dataDelete}`)
            .then((response) => {
                handleFetchData();
                handleClickDeleteSuccess();
            })
            .catch((error) => {
                const isError = UnauthorizedError.checkError(error);
                if (!isError) {
                    const title = 'Lỗi';
                    let content = '';
                    const {
                        status,
                        data: { error_message: errorMessage },
                    } = error.response;
                    if (status === 400 && errorMessage === 'Required more information') {
                        content = 'Cần gửi đầy đủ thông tin';
                    } else if (status === 400 && errorMessage === 'Delete not success') {
                        content = 'Xóa khoa không thành công';
                    } else {
                        content = 'Lỗi máy chủ';
                    }
                    ErrorCommon(title, content);
                }
            });
    };
    const handleSubmitCreatePaymentMethods = () => {
        if (isValuePaymentMethods.length === 0) {
            setErrorPaymentMethods(true);
        } else {
            handleCreatePaymentMethods();
        }
    };
    const handleSubmitEditPaymentMethods = () => {
        handleUpdatePaymentMethods();
        setOpenModalEdit(false);
    };
    const handleSubmitDeletePaymentMethods = () => {
        handleDeletePaymentMethods();
        setDeleteModalVisible(false);
    };

    //Khai báo các State quản lí trạng thái
    const [openModal, setOpenModal] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isValuePaymentMethods, setIsValuePaymentMethods] = useState('');
    const [errorPaymentMethods, setErrorPaymentMethods] = useState(false);

    const handleChangeValuePaymentMethods = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = e.target.value;
        setIsValuePaymentMethods(e.target.value);
        if (selectedValue !== '') {
            setErrorPaymentMethods(false);
        }
    };

    const handleEdit = (item: { id: number; paymentMethodName: string }) => {
        setOpenModalEdit(true);
        setSelectedItemEdit(item);
    };

    const handleChangeEdit = (e: { target: { value: any } }) => {
        setSelectedItemEdit({ ...selectedItemEdit, paymentMethodName: e.target.value || null });
    };
    const handleDelete = (item: { id: number }) => {
        setDeleteModalVisible(true);
        setSelectedItemDelete(item);
    };

    const handleShowModal = () => {
        setOpenModal(true);
    };
    const handleCancel = () => {
        setOpenModal(false);
    };
    const handleCancelEdit = () => {
        setOpenModalEdit(false);
    };
    const handleClickSuccess = () => {
        Notification('success', 'Thông báo', 'Tạo Khoa thành công');
    };
    const handleClickEditSuccess = () => {
        Notification('success', 'Thông báo', 'Cập nhật thành công khoa');
    };
    const handleClickDeleteSuccess = () => {
        Notification('success', 'Thông báo', 'Xóa thành công khoa');
    };
    return (
        <>
            <div className="container mt-5 ">
                <div className="flex justify-end mb-5">
                    <Button type="primary" onClick={handleShowModal}>
                        <MdPersonAdd />
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={dataPaymentMethods}
                    loading={isLoading}
                    pagination={{
                        defaultPageSize: 6,
                        showSizeChanger: true,
                        pageSizeOptions: ['4', '6', '8', '12', '16'],
                    }}
                >
                    {/* <Spin spinning={isLoading} size="large"></Spin> */}
                </Table>
            </div>
            {/* Modal thêm khoa */}
            <>
                <Modal
                    className="custom-modal-create_and_edit_paymentMethods"
                    open={openModal}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <div className="p-5">
                        <span className="text-lg font-medium">Thêm khoa</span>
                        <div className="mt-10">
                            <label htmlFor="">Tên khoa</label>
                            <Input
                                onChange={handleChangeValuePaymentMethods}
                                value={isValuePaymentMethods}
                                className="bg-slate-200"
                            />
                            {errorPaymentMethods && <p className="text-red-500">Vui lòng điền vào chỗ trống</p>}
                        </div>

                        <div className="flex justify-end items-end ">
                            <Button onClick={handleSubmitCreatePaymentMethods} type="primary" className="cstCreatePaymentMethods">
                                Lưu
                            </Button>
                        </div>
                    </div>
                </Modal>
            </>
            {/* Modal sửa khoa */}
            <>
                <Modal
                    className="custom-modal-create_and_edit_paymentMethods"
                    open={openModalEdit}
                    onCancel={handleCancelEdit}
                    footer={null}
                >
                    <div className="p-5">
                        <span className="text-lg font-medium">Sửa khoa</span>
                        <div className="mt-10">
                            <label htmlFor="">Tên khoa</label>
                            <Input
                                onChange={(e) => handleChangeEdit({ target: e.target })}
                                value={selectedItemEdit?.paymentMethodName}
                                className="bg-slate-200"
                            />
                        </div>

                        <div className="flex justify-end items-end">
                            <Button onClick={handleSubmitEditPaymentMethods} type="primary" className="cstCreatePaymentMethods">
                                Lưu
                            </Button>
                        </div>
                    </div>
                </Modal>
            </>
            {/* Modal xóa khoa */}
            <>
                <div>
                    <Modal
                        className="delete "
                        title="Xác nhận xóa"
                        visible={deleteModalVisible}
                        onCancel={() => setDeleteModalVisible(false)}
                        footer={null}
                    >
                        <div>
                            <p>Bạn có chắc chắn muốn xóa không?</p>
                        </div>
                        <div className="flex justify-end h-full mt-20">
                            <Button onClick={handleSubmitDeletePaymentMethods} type="primary" className="mr-5">
                                Xóa
                            </Button>
                            <Button onClick={() => setDeleteModalVisible(false)} type="default" className="mr-5">
                                Hủy
                            </Button>
                        </div>
                    </Modal>
                </div>
            </>
        </>
    );
};

export default AppPaymentMethods;
