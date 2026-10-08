// Accounts remembered on this device for quick switching. Only the session
// token is kept, never the password; an expired token asks for the password again.
const SAVED_ACCOUNTS_STORAGE_KEY = 'capubbs-saved-accounts';

export type SavedAccount = {
  avatar: string;
  token: string;
  username: string;
};

export function readSavedAccounts(): SavedAccount[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(SAVED_ACCOUNTS_STORAGE_KEY) ?? '[]') as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((account): account is SavedAccount => Boolean(account)
      && typeof account.username === 'string' && account.username !== ''
      && typeof account.token === 'string'
      && typeof account.avatar === 'string');
  } catch {
    return [];
  }
}

export function saveAccount(account: SavedAccount) {
  const accounts = readSavedAccounts();
  const index = accounts.findIndex((item) => item.username === account.username);
  if (index === -1) accounts.push(account);
  else accounts[index] = account;
  writeSavedAccounts(accounts);
}

export function removeSavedAccount(username: string) {
  writeSavedAccounts(readSavedAccounts().filter((account) => account.username !== username));
}

function writeSavedAccounts(accounts: SavedAccount[]) {
  try {
    window.localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Storage may be unavailable (private mode); switching then only covers the current session.
  }
}
