// src/unti/vnpay.js
import instance from "./axios.cusomize";

/**
 * Tạo URL thanh toán VNPay
 * @param {number} orderId 
 * @param {number} amount 
 * @returns {Promise<{ paymentUrl: string }>}
 */
export const createVnPayApi = (payload) => {
    // payload should include: items, shipping_name, shipping_phone, shipping_address, note, email
    console.log('[vnpay] createVnPayApi payload', payload);
    return instance.post("/api/vnpay/create", payload);
};

/**
 * Kiểm tra trạng thái thanh toán (nếu cần dùng)
 * @param {number} orderId 
 * @returns {Promise<any>}
 */
export const checkVnPayStatusApi = (orderId) => {
    return instance.get(`/api/vnpay/status/${orderId}`);
};
