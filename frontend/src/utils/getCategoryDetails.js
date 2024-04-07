import {
  faShoppingCart,
  faHome,
  faFunnelDollar,
  faUtensils,
  faPiggyBank,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

// This function matches a category ID to its details including a specific or fallback icon
export const getCategoryDetails = (categoryId, categories) => {
  const category = categories.find((cat) => cat._id === categoryId);
  const categoryName = category ? category.title : 'Unknown';

  let icon;
  switch (categoryName) {
    case 'Groceries':
      icon = faShoppingCart;
      break;
    case 'Rent':
      icon = faHome;
      break;
    case 'Fun Money':
      icon = faFunnelDollar;
      break;
    case 'Eating Out':
      icon = faUtensils;
      break;
    case 'Savings':
      icon = faPiggyBank;
      break;
    default:
      icon = faUser; // Fallback icon for custom categories
  }

  return { categoryName, icon };
};
