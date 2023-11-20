// Delta class to represent a delta entry
class Delta {
  constructor(type, data) {
      this.type = type;
      this.data = data;
  }
}

// DeltaProcessor class to handle processing of deltas
class DeltaProcessor {
  constructor(financialGridSnapshot) {
      this.financialGridSnapshot = financialGridSnapshot;
      this.deltas = []; // Array of Delta objects
      this.isProcessing = false;
      this.currentIndex = 0; // Track the current index in deltas array
  }

  // Fetch and process deltas from Deltas.csv
  fetchAndProcessDeltas = async function () {
      if (this.isProcessing) {
          console.log('Already processing, skipping...');
          // Avoid overlapping fetches
          return;
      }

      const url = './data/Deltas.csv';
      this.isProcessing = true;

      try {
          const response = await fetch(url);
          const csvData = await response.text();
          this.parseDeltas(csvData);
          this.processDeltas();
      } catch (error) {
          console.error('Error fetching deltas:', error);
      } finally {
          this.isProcessing = false;
      }
  };

  // Parse CSV data into Delta objects
  parseDeltas = function (csvData) {
      const rows = csvData.split('\n').slice(1); // Skip header row
      this.deltas = rows.map(row => {
          const [dataString] = row.split(',');

          if (!isNaN(parseInt(dataString))) {
              console.log('Parsed delay:', parseInt(dataString));
              return new Delta('delay', parseInt(dataString));
          } else {
              console.log('Parsed data:', dataString.split(','));
              return new Delta('data', dataString.split(','));
          }
      });
  };

  // Process deltas and update financial data
  processDeltas = function () {
      const financialData = this.financialGridSnapshot.data;

      // Process deltas starting from the current index
      for (let i = this.currentIndex; i < this.deltas.length; i++) {
          const delta = this.deltas[i];

          if (delta.type === 'delay') {
              console.log('Delaying for', delta.data, 'milliseconds');
              // If it's a delay, wait and then continue processing
              setTimeout(() => {
                  this.currentIndex = i + 1; // Move to the next delta
                  console.log('Resuming processing after delay');
                  this.processDeltas();
              }, delta.data);
              return;
          } else if (delta.type === 'data') {
              const [name, companyName, price, change, chgPercent, marketCap] = delta.data;

              // Find the corresponding financial data object
              const financialDataEntry = financialData.find(item => item.name === name);

              // Update the financial data
              if (financialDataEntry) {
                  financialDataEntry.price = parseFloat(price);
                  financialDataEntry.change = parseFloat(change);
                  financialDataEntry.chgPercent = chgPercent;
                  financialDataEntry.marketCap = marketCap;

                  console.log('Updated financial data for', name);
                  // Highlight the updated row for visual notification
                  const updatedRow = document.getElementById(`financialGridSnapshotRow-${financialDataEntry.name}`);

                  if (updatedRow) {
                      updatedRow.classList.add('updated');

                      // Remove the highlighting after a short delay
                      setTimeout(() => {
                          updatedRow.classList.remove('updated');
                      }, 500);
                  }
              }
          }
      }

      // Update the DOM to reflect the latest financial data
      this.financialGridSnapshot.render();

      // If all deltas processed, return to the start
      this.currentIndex = 0;

      // Repeat the process of fetching and processing deltas
      this.fetchAndProcessDeltas();
  };
}

// Example usage
const deltaProcessor = new DeltaProcessor(financialGridSnapshot);
deltaProcessor.fetchAndProcessDeltas();
