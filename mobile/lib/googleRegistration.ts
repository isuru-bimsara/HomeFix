let pendingGoogleIdToken = "";

export function setPendingGoogleIdToken(token: string) {
  pendingGoogleIdToken = token;
}

export function getPendingGoogleIdToken() {
  return pendingGoogleIdToken;
}

export function clearPendingGoogleIdToken() {
  pendingGoogleIdToken = "";
}
