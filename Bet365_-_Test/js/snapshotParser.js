// FinancialData class to represent financial data
function FinancialDataSnapshot(name, companyName, price, change, chgPercent, marketCap) {
    this.name = name;
    this.companyName = companyName;
    this.price = price;
    this.change = change;
    this.chgPercent = chgPercent;
    this.marketCap = marketCap;
}

// FinancialGridSnapshot class to handle data loading and rendering
function FinancialGridSnapshot(containerId, data = []) {
    this.container = document.getElementById(containerId);
    this.data = Array.isArray(data) ? data : [];
}

// Load data from CSV string
FinancialGridSnapshot.prototype.loadData = function (csvData) {
    const rows = csvData.split('\n').slice(1); // Skip header row
    this.data = rows.map(row => {
        const [name, companyName, price, change, chgPercent, marketCap] = row.split(',');
        return new FinancialDataSnapshot(
            name,
            companyName,
            parseFloat(price),
            parseFloat(change),
            chgPercent,
            marketCap
        );
    });
};

// Render the grid to the DOM
FinancialGridSnapshot.prototype.render = function () {
    const table = document.createElement('table');
    const headerRow = table.insertRow();

    if (this.data.length === 0) {
        // Handle empty data
        const emptyCell = document.createElement('th');
        emptyCell.textContent = 'No data available';
        headerRow.appendChild(emptyCell);
    } else {
        // Render header row based on the first item's properties
        for (const prop in this.data[0]) {
            const th = document.createElement('th');
            th.textContent = prop;
            headerRow.appendChild(th);
        }

        // Render data rows
        this.data.forEach(item => {
            const row = table.insertRow();
            for (const prop in item) {
                const cell = row.insertCell();
                cell.textContent = item[prop];
            }
        });
    }

    this.container.innerHTML = '';
    this.container.appendChild(table);
};

// Fetch and process snapshot data using Fetch API
FinancialGridSnapshot.prototype.fetchAndProcessData = async function () {
    const url = './data/snapshot.csv';

    try {
        const response = await fetch(url);
        const csvData = await response.text();
        this.loadData(csvData);
        this.render();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Example usage
const financialGridSnapshot = new FinancialGridSnapshot('financialGridContainerSnapshot');
financialGridSnapshot.fetchAndProcessData();
