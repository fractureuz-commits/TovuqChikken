import { apiFetch } from './api';

// API endpoints for reference data
export const REFERENCE_API = {
    brands: "/tovuq/hs/brand/get_brand",
    olchov: "/tovuq/hs/olchov/get_olchov",
};

// Load brands from 1C or localStorage
export const loadBrands = async () => {
    try {
        // Try to load from localStorage first
        const localBrands = localStorage.getItem("brands");
        if (localBrands) {
            return JSON.parse(localBrands);
        }

        // If not in localStorage, try to fetch from 1C
        const brands = await apiFetch("brands", { timeoutMs: 10000, retries: 1 });
        if (brands && Array.isArray(brands)) {
            localStorage.setItem("brands", JSON.stringify(brands));
            return brands;
        }

        return [];
    } catch (error) {
        console.error("Error loading brands:", error);
        return [];
    }
};

// Load units of measurement from 1C or localStorage
export const loadOlchov = async () => {
    try {
        // Try to load from localStorage first
        const localOlchov = localStorage.getItem("olchov");
        if (localOlchov) {
            return JSON.parse(localOlchov);
        }

        // If not in localStorage, try to fetch from 1C
        const olchov = await apiFetch("olchov", { timeoutMs: 10000, retries: 1 });
        if (olchov && Array.isArray(olchov)) {
            localStorage.setItem("olchov", JSON.stringify(olchov));
            return olchov;
        }

        return [];
    } catch (error) {
        console.error("Error loading olchov:", error);
        return [];
    }
};

// Save brands to localStorage
export const saveBrands = (data) => {
    localStorage.setItem("brands", JSON.stringify(data));
};

// Save units to localStorage
export const saveOlchov = (data) => {
    localStorage.setItem("olchov", JSON.stringify(data));
};

// Load all reference data at startup
export const loadAllReferenceData = async () => {
    try {
        const [brands, olchov] = await Promise.all([
            loadBrands(),
            loadOlchov(),
        ]);

        console.log("Reference data loaded:", { brands: brands.length, olchov: olchov.length });
        return { brands, olchov };
    } catch (error) {
        console.error("Error loading reference data:", error);
        return { brands: [], olchov: [] };
    }
};
