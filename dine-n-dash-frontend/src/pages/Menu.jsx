import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiSearch, FiUser } from 'react-icons/fi';
import { BiRestaurant } from 'react-icons/bi';
import { BsCart3 } from 'react-icons/bs';
import { GiKnifeFork } from 'react-icons/gi';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

export default function Menu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState({});
  const [cartTotal, setCartTotal] = useState(0);

  // Fetch menu items from the backend
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // TODO: Replace with actual restaurant ID from QR code or route params
        const restaurantId = 'ec69f27e-aaee-434f-bbdf-ae32199d66c5';
        const response = await axios.get(`http://localhost:5001/api/restaurants/${restaurantId}/menu`);
        setMenuItems(response.data);
      } catch (error) {
        toast.error('Failed to load menu');
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Update cart total whenever cartItems changes
  useEffect(() => {
    const total = Object.entries(cartItems).reduce((sum, [itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
    setCartTotal(total);
  }, [cartItems, menuItems]);

  const handleAddToCart = (itemId) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: 1
    }));
    toast.success('Item added to cart');
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => {
      const newQuantity = (prev[itemId] || 0) + delta;
      if (newQuantity <= 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: newQuantity
      };
    });
  };

  // Get unique categories from menu items
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter menu items by selected category and search query
  const filteredItems = menuItems
    .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
    .filter(item => 
      searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleItemClick = (item, event) => {
    // Prevent navigation if clicking the add to cart button
    if (event.target.closest('button')) {
      return;
    }
    navigate(`/menu/${item.id}`, {
      state: {
        menuItem: item,
        restaurantId: 'ec69f27e-aaee-434f-bbdf-ae32199d66c5' // TODO: Get this from route params or context
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF4E3]">
      {/* Header */}
      <div className="p-6 pb-0 sticky top-0 bg-[#FBF4E3] z-10">
        <div className="mb-8">
          <div className="flex items-center mb-1">
            <GiKnifeFork className="text-[#215719] text-3xl mr-2 transform hover:rotate-12 transition-transform duration-300" />
            <span className="text-[#215719] text-2xl font-serif">Dine</span>
          </div>
          <p className="text-sm text-[#215719] font-['Lobster'] tracking-wide">Powered By Dine-N-Dash</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 transform transition-all duration-300 hover:scale-[1.02]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#215719]/60" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-full bg-white/80 backdrop-blur-sm text-[#215719] placeholder-[#215719]/60 focus:outline-none border border-[#215719]/10 shadow-sm focus:shadow-md transition-all duration-300"
          />
        </div>

        {/* Category Navigation */}
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="flex space-x-3 pb-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-[#215719] text-white shadow-md'
                    : 'bg-white/80 backdrop-blur-sm text-[#215719] hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-6 pb-24 space-y-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={(e) => handleItemClick(item, e)}
            className="bg-white/80 backdrop-blur-sm rounded-[20px] p-4 flex items-center space-x-4 transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-white cursor-pointer"
          >
            <img
              src={item.image || 'https://via.placeholder.com/80'}
              alt={item.name}
              className="w-20 h-20 rounded-[15px] object-cover shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[#215719] text-lg mb-1">{item.name}</h3>
              <p className="text-sm text-[#215719]/60 line-clamp-1 mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#215719] text-lg">EGP {item.price.toFixed(0)}</span>
                {cartItems[item.id] ? (
                  <div className="flex items-center space-x-2 bg-[#215719]/5 rounded-full px-3 py-1.5 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, -1);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-[#215719] text-white hover:bg-[#215719]/80 transition-all duration-300 transform hover:scale-110"
                    >
                      <AiOutlineMinus size={14} />
                    </button>
                    <span className="text-[#215719] font-medium w-8 text-center">
                      {cartItems[item.id]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, 1);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-[#215719] text-white hover:bg-[#215719]/80 transition-all duration-300 transform hover:scale-110"
                    >
                      <AiOutlinePlus size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="px-5 py-2 rounded-full bg-[#215719]/10 text-[#215719] text-sm font-medium hover:bg-[#215719] hover:text-white transition-all duration-300 transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item.id);
                    }}
                  >
                    Add to cart
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#215719] text-white px-6 flex items-center justify-between shadow-lg backdrop-blur-lg bg-opacity-95">
        <BiRestaurant className="text-2xl transform hover:rotate-12 transition-transform duration-300" />
        <button className="flex items-center space-x-3 py-2 px-4 rounded-full hover:bg-white/10 transition-all duration-300">
          <BsCart3 className="text-xl" />
          <span className="font-medium">View Cart</span>
          <span className="ml-2 bg-white/20 px-3 py-1 rounded-full">EGP{cartTotal.toFixed(0)}</span>
        </button>
        <FiUser className="text-2xl hover:text-white/80 transition-colors duration-300" />
      </div>
    </div>
  );
}
  