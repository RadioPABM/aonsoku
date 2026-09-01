interface NetworkInformation {
  type?: string
  saveData?: boolean
}

/**
 * Whether this is a connection the user would rather we did not spend.
 *
 * Only Android fills the Network Information API in; everywhere else it is
 * missing and this answers false, so a desktop or a browser that keeps the
 * details to itself is never treated as metered.
 */
export function isMeteredConnection() {
  const { connection } = navigator as Navigator & {
    connection?: NetworkInformation
  }

  if (!connection) return false
  if (connection.saveData) return true

  return connection.type === 'cellular'
}
