import axios from 'axios';

const API_BASE = 'http://192.168.1.101:8000/api'; // gunakan IP LAN komputer server Anda

export const fetchProducts = () => axios.get(`${API_BASE}/products/`);
export const fetchCategories = () => axios.get(`${API_BASE}/categories/`);
export const fetchBanners = () => axios.get(`${API_BASE}/banners/`);
export const createOrder = (orderData) => axios.post(`${API_BASE}/orders/`, orderData);
