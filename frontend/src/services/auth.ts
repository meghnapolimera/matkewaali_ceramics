const IDENTITY_POOL_ID = import.meta.env.VITE_IDENTITY_POOL_ID
const AWS_REGION = import.meta.env.VITE_AWS_REGION
const COGNITO_ENDPOINT = `https://cognito-identity.${AWS_REGION}.amazonaws.com/`

export interface AWSCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  expiration: Date
}

let cached: AWSCredentials | null = null
let inflight: Promise<AWSCredentials> | null = null

async function fetchCredentials(): Promise<AWSCredentials> {
  const idRes = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityService.GetId',
    },
    body: JSON.stringify({ IdentityPoolId: IDENTITY_POOL_ID }),
  })
  const { IdentityId } = await idRes.json()

  const credsRes = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
    },
    body: JSON.stringify({ IdentityId }),
  })
  const { Credentials } = await credsRes.json()

  return {
    accessKeyId: Credentials.AccessKeyId,
    secretAccessKey: Credentials.SecretKey,
    sessionToken: Credentials.SessionToken,
    expiration: new Date(Credentials.Expiration * 1000),
  }
}

export async function getCredentials(): Promise<AWSCredentials> {
  if (cached && cached.expiration > new Date(Date.now() + 60_000)) {
    return cached
  }
  if (!inflight) {
    inflight = fetchCredentials()
      .then(creds => {
        cached = creds
        inflight = null
        return creds
      })
      .catch(err => {
        inflight = null
        throw err
      })
  }
  return inflight
}
