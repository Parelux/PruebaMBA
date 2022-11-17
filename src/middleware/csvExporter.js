const createCsvWriter = require('csv-writer').createObjectCsvWriter;

/**
 * Get or create a new CSV file with today timestamp to store transactions
 * Columns: [sender, receiver, amount, timestamp]
 * @returns 
 */
const getOrCreateCSVFile = async () => {
    let todayDate = new Date().toISOString().slice(0, 10);
    let csvWriter = undefined;
    
    try {
        csvWriter = await createCsvWriter({
            path: '/historical/transactions_'+todayDate+'.csv',
            header: [
                {id: 'sender', title: 'Sender'},
                {id: 'receiver', title: 'Receiver'},
                {id: 'amount', title: 'Amount'},
                {id: 'ts', title: 'Timestamp'}
            ],
            append: true,
        });
    } catch (e) {
        console.error("Error retrieving/creating CSV transactions historical: " + e)
        return undefined;
    }
    return csvWriter;
}

/**
 * Add a new historic about a recently performed transaction to a CSV file.
 * @param {*} req 
 */
const exportTransactionToCSV = async (req, res, next) => {
    const sender = req.transaction.originAccountId;
    const receiver = req.transaction.targetAccountId;
    const amount = req.transaction.amount;
    const ts = req.transaction.timestamp;

    const record = [sender, receiver, amount, ts]

    const csvWriter = await getOrCreateCSVFile()
    if(csvWriter === undefined) {
        console.error("Error retrieving CSV file, transaction history not saved: ", record)
        return 
    }

    try {
        await csvWriter.writeRecords(record);
        console.table('Transaction added to CSV: ', record);
    } catch (e) {
        console.error('Error trying to add a new transaction to CSV file: ', e)
    }
}

module.exports = exportTransactionToCSV;