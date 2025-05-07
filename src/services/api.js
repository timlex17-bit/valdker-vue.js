import axios from 'axios';

const API_BASE = 'https://mypos-production.up.railway.app/api'; // ganti sesuai IP server Anda

export const fetchProducts = () => axios.get(`${API_BASE}/products/`);
export const fetchCategories = () => axios.get(`${API_BASE}/categories/`);
export const fetchBanners = () => axios.get('https://mypos-production.up.railway.app/api/banners/');

export const createOrder = (orderData) => axios.post(`${API_BASE}/orders/`, orderData);

