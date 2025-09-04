import { createClient } from './supabase/client';

/**
 * Creates default sample accounts for a new user
 * @param userId The user ID to create accounts for
 * @returns A Promise that resolves when all accounts are created
 */
export async function createSampleAccounts(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  const supabase = createClient();
  
  try {
    // Check if user already has any accounts
    const { data: existingAccounts, error: checkError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing accounts:", checkError);
      return false;
    }
    
    // If user already has accounts, don't create sample ones
    if (existingAccounts && existingAccounts.length > 0) {
      return false;
    }
    
    // Sample account data for each account type
    const sampleAccounts = [
      {
        user_id: userId,
        account_type: 'mpesa',
        account_number: '254' + Math.floor(700000000 + Math.random() * 99999999),
        account_name: 'M-Pesa Sample',
        is_active: true,
        balance: 5000 + Math.floor(Math.random() * 10000) // Between 5000 and 15000
      },
      {
        user_id: userId,
        account_type: 'sbm',
        account_number: Math.floor(10000000 + Math.random() * 90000000).toString(),
        account_name: 'SBM Sample',
        additional_data: { accountType: 'Savings' },
        is_active: true,
        balance: 25000 + Math.floor(Math.random() * 50000) // Between 25000 and 75000
      },
      {
        user_id: userId,
        account_type: 'coop',
        account_number: Math.floor(10000000 + Math.random() * 90000000).toString(),
        account_name: 'Co-op Sample',
        additional_data: { branch: 'Main Branch' },
        is_active: true,
        balance: 10000 + Math.floor(Math.random() * 20000) // Between 10000 and 30000
      }
    ];
    
    // Insert accounts one by one and create balance records
    for (const account of sampleAccounts) {
      // Extract balance from our temp object
      const { balance, ...accountData } = account;
      
      // Create account
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert(accountData)
        .select('id')
        .single();
      
      if (accountError || !newAccount) {
        console.error(`Error creating ${account.account_type} sample account:`, accountError);
        continue;
      }
      
      // Create balance record for this account
      const { error: balanceError } = await supabase
        .from('balances')
        .insert({
          account_id: newAccount.id,
          amount: balance, 
          currency: 'KES',
          last_updated: new Date().toISOString()
        });
      
      if (balanceError) {
        console.error(`Error creating balance for ${account.account_type} sample account:`, balanceError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error creating sample accounts:", error);
    return false;
  }
}

/**
 * Creates sample transactions for the user's accounts
 * @param userId The user ID to create transactions for
 * @returns A Promise that resolves when all transactions are created
 */
export async function createSampleTransactions(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  const supabase = createClient();
  
  try {
    // Check if user already has any transactions
    const { data: existingTransactions, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', userId)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing transactions:", checkError);
      return false;
    }
    
    // If user already has transactions, don't create sample ones
    if (existingTransactions && existingTransactions.length > 0) {
      return false;
    }
    
    // Get all accounts for this user
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, account_type')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (accountsError || !accounts || accounts.length === 0) {
      console.error("Error fetching accounts or no accounts found:", accountsError);
      return false;
    }
    
    // Transaction categories by account type
    const categories = {
      mpesa: ['Shopping', 'Transport', 'Food', 'Entertainment', 'Bills'],
      sbm: ['Salary', 'Rent', 'Utilities', 'Insurance', 'Savings'],
      coop: ['Groceries', 'Healthcare', 'Education', 'Travel', 'Investments']
    };
    
    const transactionDescriptions = {
      mpesa: {
        credit: ['Received from', 'Deposit from', 'Refund from', 'Payment from'],
        debit: ['Payment to', 'Sent to', 'Purchase at', 'Bill payment to']
      },
      sbm: {
        credit: ['Deposit', 'Salary payment', 'Interest earned', 'Refund', 'Transfer from'],
        debit: ['Withdrawal', 'Monthly rent', 'Bill payment', 'Transfer to', 'Service fee']
      },
      coop: {
        credit: ['Deposit', 'Interest', 'Dividend', 'Transfer in', 'Loan disbursement'],
        debit: ['Withdrawal', 'Standing order', 'Loan repayment', 'ATM withdrawal', 'Service charge']
      }
    };
    
    // Create transactions for each account
    const now = new Date();
    
    for (const account of accounts) {
      // Create between 5-10 transactions per account
      const numTransactions = 5 + Math.floor(Math.random() * 6);
      const accountType = account.account_type as keyof typeof categories;
      
      for (let i = 0; i < numTransactions; i++) {
        // Random date within last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const transactionDate = new Date(now);
        transactionDate.setDate(now.getDate() - daysAgo);
        
        // Random transaction type with bias towards debits (70% debit, 30% credit)
        const type = Math.random() < 0.7 ? 'debit' : 'credit';
        
        // Random category for this account type
        const categoryList = categories[accountType];
        const category = categoryList[Math.floor(Math.random() * categoryList.length)];
        
        // Random description
        const descriptionList = transactionDescriptions[accountType][type as 'credit' | 'debit'];
        const descriptionPrefix = descriptionList[Math.floor(Math.random() * descriptionList.length)];
        let description = `${descriptionPrefix} `;
        
        // Add more context to description
        if (type === 'debit') {
          if (accountType === 'mpesa') {
            const shops = ['Carrefour', 'Naivas', 'Quickmart', 'Artcaffe', 'Java House'];
            description += shops[Math.floor(Math.random() * shops.length)];
          } else {
            description += `${category} payment`;
          }
        } else {
          const names = ['John', 'Jane', 'Michael', 'Sarah', 'David'];
          description += names[Math.floor(Math.random() * names.length)];
        }
        
        // Random amount based on transaction type
        let amount = 0;
        if (type === 'debit') {
          amount = 100 + Math.floor(Math.random() * 5000); // Between 100 and 5,100
        } else {
          amount = 500 + Math.floor(Math.random() * 15000); // Between 500 and 15,500
        }
        
        // Random reference number
        const reference = `REF${Math.floor(Math.random() * 1000000)}`;
        
        // Create the transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            account_id: account.id,
            date: transactionDate.toISOString(),
            description,
            amount,
            type,
            category,
            reference_number: reference,
            status: 'completed'
          });
        
        if (transactionError) {
          console.error("Error creating sample transaction:", transactionError);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error creating sample transactions:", error);
    return false;
  }
}