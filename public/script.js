// Make an HTTP request to retrieve data from the server
fetch('/data')
    .then((response) => response.json())
    .then((data) => {
        // Clear the table body
        const tableBody = document.querySelector('#tickerTable tbody');
        tableBody.innerHTML = '';

        // Update the last traded price
        const lastTradeElement = document.querySelector('#lastTrade');
        lastTradeElement.textContent = `Last Traded Price: ${data[0].last}`;

        // Loop through the data and create table rows
        data.forEach((item) => {
            const row = document.createElement('tr');
            const difference = item.difference !== null ? `${item.difference.toFixed(2)}%` : 'Null';
            const buyInr = formatCurrency(item.buy); // Convert buy price to formatted INR
            const sellInr = formatCurrency(item.sell); // Convert sell price to formatted INR
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td class="${item.last < 0 ? 'negative' : 'positive'}">${item.last}</td>
                <td class="${item.buy < 0 ? 'negative' : 'positive'}">${buyInr}</td>
                <td class="${item.sell < 0 ? 'negative' : 'positive'}">${sellInr}</td>
                <td>${difference}</td>
                <td>${item.volume}</td>
                <td>${item.base_unit}</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });

// Function to format currency with Indian Rupee symbol and comma-separated thousands
function formatCurrency(amount) {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    });
    return formatter.format(amount);
}
