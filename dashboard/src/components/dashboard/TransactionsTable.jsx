const mockTransactions = [
    { name: "Cy Ganderton", date: "Feb 2nd", amount: "180 USD" },
    // Add more mock transactions here
];

function TransactionsTable() {
    return (
        <table className="table table-zebra">
            <tbody>
                {mockTransactions.map((transaction, index) => (
                    <tr key={index}>
                        <td>{transaction.name}</td>
                        <td>{transaction.date}</td>
                        <td>{transaction.amount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default TransactionsTable;
