import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api'; // ganti sesuai IP server Anda

export const fetchProducts = () => axios.get(`${API_BASE}/products/`);
export const fetchCategories = () => axios.get(`${API_BASE}/categories/`);
export const fetchBanners = () => axios.get('http://127.0.0.1:8000/api/banners/');

export const createOrder = (orderData) => axios.post(`${API_BASE}/orders/`, orderData);

