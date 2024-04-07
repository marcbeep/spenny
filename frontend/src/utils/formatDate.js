export const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
