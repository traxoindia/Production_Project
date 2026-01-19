// ProductList.jsx
import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, User, ClipboardList, RefreshCwIcon } from 'lucide-react';
import { toast } from 'react-toastify';
 // Adjust path as necessary (assuming this is the correct navbar for this page)

// --- API Endpoint for fetching products ---
const FETCH_PRODUCTS_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchProduct"; 

// --- 💻 Main Component: ProductList ---
function ProductList() {
    const [products, setProducts] = useState([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    // Function to fetch all Products
    const fetchProducts = async () => {
        setLoadingTable(true);
        const token = localStorage.getItem("token");

        if (!token) {
             console.error("Token missing. Cannot fetch Products.");
             setProducts([]);
             setLoadingTable(false);
             return;
        }

        try {
            const response = await fetch(FETCH_PRODUCTS_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched Product Data:", data);
            
            // --- DATA MAPPING CORRECTION ---
            // The product list is reliably found under data.allProduct
            const productList = data.allProduct;
            
            if (productList && Array.isArray(productList)) {
                const fetchedProducts = productList
                    .map(item => ({
                        id: item._id,
                        name: item.productName || 'N/A',
                        modelNo: item.modelNo || 'N/A',
                        partNo: item.partNo || 'N/A',
                        // Accessing the exact key from API response: TacNo
                        tacNo: item.TacNo || 'N/A', 
                        type: item.productType || 'N/A',
                        // Assuming 'Active' as default status
                        status: 'Active', 
                    }));
                
                setProducts(fetchedProducts);
            } else {
                console.error("API response structure is incorrect: missing 'allProduct' array.");
                setProducts([]);
            }
            
        } catch (error) {
            console.error("Error fetching Products:", error);
            toast.error(`Error loading products: ${error.message}.`, { position: "top-right" });
            setProducts([]); 
        } finally {
            setLoadingTable(false);
        }
    };

    // Fetch products when the component mounts or when refreshTrigger changes
    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);


    return (
        <>
  
        
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header and Button */}
                    <header className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <Package size={30} className="text-green-600" />
                            Registered Products List
                        </h1>
                        
                        <button
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white 
                                       font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                            disabled={loadingTable}
                        >
                            <RefreshCw size={20} className={`mr-2 ${loadingTable ? 'animate-spin' : ''}`} />
                            Refresh List
                        </button>
                    </header>
                    
                    {/* --- Products Table UI --- */}
                    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                        <div className="p-5 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Total Products ({products.length})
                            </h2>
                        </div>
                        
                        {loadingTable ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2">Fetching product data...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tac No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.length > 0 ? (
                                            products.map((product) => (
                                                <tr key={product.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.modelNo}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.partNo}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.tacNo}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                                        <button className="text-red-600 hover:text-red-900">Archive</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    No products registered.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductList;