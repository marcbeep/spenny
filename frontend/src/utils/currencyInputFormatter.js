export const formatCurrencyInput = (inputValue) => {
    const input = inputValue.replace(/[^0-9]/g, ''); // Strip non-numeric characters
    if (input === '') {
      return '0.00';
    }
    let integerInput = parseInt(input, 10);
    let newAmount = (integerInput / 100).toFixed(2); // Shift decimal two places left
    return newAmount.toString();
  };
  