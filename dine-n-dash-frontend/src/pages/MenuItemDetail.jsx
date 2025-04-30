import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function MenuItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [menuItem, setMenuItem] = useState(location.state?.menuItem || null);
  const [restaurantTheme, setRestaurantTheme] = useState({
    primary: '#215719',
    background: '#FBF4E3'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  // Get restaurantId from location state or URL params
  const restaurantId = location.state?.restaurantId || 'ec69f27e-aaee-434f-bbdf-ae32199d66c5'; // Fallback to default ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If we don't have the menu item in state, fetch the menu and find the item
        if (!menuItem) {
          const menuResponse = await axios.get(`http://localhost:5001/api/restaurants/${restaurantId}/menu`);
          console.log('Menu response:', menuResponse.data);
          
          const item = menuResponse.data.find(item => item.id === id);
          if (!item) {
            throw new Error('Menu item not found');
          }
          setMenuItem(item);
        }

        // Try to fetch restaurant data, but don't fail if it's not available
        try {
          const restaurantResponse = await axios.get(`http://localhost:5001/api/restaurants/${restaurantId}`);
          console.log('Restaurant data:', restaurantResponse.data);
          
          if (restaurantResponse.data) {
            setRestaurantTheme({
              primary: restaurantResponse.data.themeColor || '#215719',
              background: restaurantResponse.data.backgroundColor || '#FBF4E3'
            });
          }
        } catch (restaurantError) {
          console.warn('Could not fetch restaurant theme, using defaults:', restaurantError);
          // Keep using default theme colors
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load menu item details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, restaurantId, menuItem]);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleOrder = () => {
    if (!menuItem) return;
    
    // TODO: Implement cart functionality
    toast.success(`Added ${quantity} ${menuItem.name}(s) to cart`);
    navigate(-1);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !menuItem) return;

    try {
      // For now, just add the comment to local state since there's no comments endpoint yet
      const newComment = {
        id: Date.now(),
        content: comment,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, newComment]);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: restaurantTheme.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: restaurantTheme.primary }}></div>
      </div>
    );
  }

  if (error || !menuItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: restaurantTheme.background }}>
        <p className="text-lg mb-4" style={{ color: restaurantTheme.primary }}>
          {error || 'Menu item not found'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-full text-white"
          style={{ backgroundColor: restaurantTheme.primary }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-32" style={{ backgroundColor: restaurantTheme.background }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-20 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg transform hover:scale-110 transition-transform duration-300 flex items-center justify-center"
        style={{ color: restaurantTheme.primary }}
      >
        <IoArrowBack size={24} />
      </button>

      {/* Hero Image */}
      <div className="w-full aspect-square relative">
        <img
          src={menuItem.image}
          alt={menuItem.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
          }}
        />
      </div>

      {/* Content */}
      <div className="px-6 py-8 -mt-6 rounded-t-[20px] relative bg-white/80 backdrop-blur-sm">
        {/* Title and Rating */}
        <div className="mb-6">
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: restaurantTheme.primary }}
          >
            {menuItem.name}
          </h1>
          <div className="flex items-center space-x-2" style={{ color: restaurantTheme.primary }}>
            {menuItem.rating && (
              <span className="flex items-center">
                ⭐ {menuItem.rating}
              </span>
            )}
            {menuItem.preparationTime && (
              <span style={{ color: `${restaurantTheme.primary}99` }}>
                — {menuItem.preparationTime}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p 
          className="mb-6 leading-relaxed"
          style={{ color: `${restaurantTheme.primary}CC` }}
        >
          {menuItem.description}
        </p>

        {/* Comments Section */}
        <div className="mb-20">
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: restaurantTheme.primary }}
          >
            Comments
          </h3>
          
          {/* Add Comment */}
          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-4 rounded-[20px] resize-none h-20 bg-white/80 backdrop-blur-sm border focus:outline-none transition-all duration-300"
              style={{ 
                borderColor: `${restaurantTheme.primary}33`,
                color: restaurantTheme.primary
              }}
            />
            <button
              onClick={handleAddComment}
              className="mt-2 px-6 py-2.5 rounded-[20px] text-white text-sm transition-all duration-300 hover:opacity-90 shadow-md hover:shadow-lg"
              style={{ backgroundColor: restaurantTheme.primary }}
            >
              Add Comment
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div 
                key={comment.id}
                className="p-4 rounded-[20px] bg-white/50 backdrop-blur-sm border"
                style={{ borderColor: `${restaurantTheme.primary}22` }}
              >
                <p style={{ color: restaurantTheme.primary }}>{comment.content}</p>
                <span 
                  className="text-sm"
                  style={{ color: `${restaurantTheme.primary}99` }}
                >
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price and Order Section - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t shadow-lg z-10"
           style={{ borderColor: `${restaurantTheme.primary}22` }}>
        <div className="flex items-center justify-between mb-3">
          <span 
            className="text-2xl font-bold"
            style={{ color: restaurantTheme.primary }}
          >
            EGP {menuItem.price.toFixed(2)}
          </span>
          
          <div className="flex items-center space-x-4 bg-white/80 rounded-[20px] py-2 px-4 border"
               style={{ borderColor: `${restaurantTheme.primary}33` }}>
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:opacity-90 transition-all duration-300 shadow-md"
              style={{ backgroundColor: restaurantTheme.primary }}
            >
              <AiOutlineMinus size={16} />
            </button>
            <span 
              className="text-xl font-semibold w-8 text-center"
              style={{ color: restaurantTheme.primary }}
            >
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:opacity-90 transition-all duration-300 shadow-md"
              style={{ backgroundColor: restaurantTheme.primary }}
            >
              <AiOutlinePlus size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={handleOrder}
          className="w-full py-3.5 text-white rounded-[20px] text-lg font-semibold transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
          style={{ backgroundColor: restaurantTheme.primary }}
        >
          ORDER NOW
        </button>
      </div>
    </div>
  );
} 