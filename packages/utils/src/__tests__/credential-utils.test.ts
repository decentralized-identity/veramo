import {
  computeEntryHash,
  decodeCredentialToObject,
  decodePresentationToObject,
  extractIssuer,
  processEntryToArray,
} from '../credential-utils.js'

describe('@veramo/utils credential utils', () => {
  it('processEntryToArray', () => {
    expect(processEntryToArray('a')).toEqual(['a'])
    expect(processEntryToArray(['a'])).toEqual(['a'])
    expect(processEntryToArray(['a', 'b'])).toEqual(['a', 'b'])
    expect(processEntryToArray(['a', 'b'])).toEqual(['a', 'b'])
    expect(processEntryToArray(undefined)).toEqual([])
    expect(processEntryToArray(null)).toEqual([])
    expect(processEntryToArray(undefined, 'start')).toEqual(['start'])
    expect(processEntryToArray(null, 'start')).toEqual(['start'])
    expect(processEntryToArray(['a', 'start'], 'start')).toEqual(['start', 'a'])
    expect(processEntryToArray(['a', 'start', null, undefined, 'b', 'a'] as any, 'start')).toEqual([
      'start',
      'a',
      'b',
    ])
  })

  it('decodeCredentialToObject', () => {
    const jwt =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk2NzYsInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIn0.IGF1LFOc4_PcGVeq7Yw7OGz4Gj7xXZK6p8bP9CSEIXz7mNFPM0v0nuevTZ47a0I8XgLfCFNkUrIIscjH8MFx_wE'
    const normalizedCred = {
      credentialSubject: {
        name: 'Alice',
        id: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
      },
      issuer: { id: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61' },
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuanceDate: '2020-02-25T08:34:36.000Z',
      proof: {
        type: 'JwtProof2020',
        jwt,
      },
    }
    const ldCred = {
      issuer: { id: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn' },
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
      type: ['VerifiableCredential', 'Profile'],
      issuanceDate: '2021-11-23T15:06:12.820Z',
      credentialSubject: {
        id: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn',
        name: 'Martin, the great',
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2021-11-23T15:06:12Z',
        verificationMethod:
          'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn#z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..wKMmMZNdIgL_19HYJgpRL9SeKVzYT85S-ZyVdF3IMiaiL8nhX8i48D82TQtuQlTT960h_TOQ18fQFula6QxADA',
      },
    }
    expect(decodeCredentialToObject(jwt)).toEqual(normalizedCred)
    expect(decodeCredentialToObject(normalizedCred)).toEqual(normalizedCred)
    expect(decodeCredentialToObject(ldCred)).toEqual(ldCred)
  })

  it('decodePresentationToObject', () => {
    const cred1 = {
      issuer: { id: 'did:ethr:0x0301240a4851f45b568809baf35921f8d78ca966738a1a0a69e693fbbd232ff080' },
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://veramo.io/contexts/profile/v1',
        'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
      ],
      type: ['VerifiableCredential', 'Profile'],
      issuanceDate: '2021-11-23T15:09:43.891Z',
      credentialSubject: { name: 'Martin, the great' },
      proof: {
        type: 'EcdsaSecp256k1RecoverySignature2020',
        created: '2021-11-23T15:09:44Z',
        verificationMethod:
          'did:ethr:0x0301240a4851f45b568809baf35921f8d78ca966738a1a0a69e693fbbd232ff080#controller',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..peNXS6DaNsCNfz8rnr_BJ49sF4yUugKqNZrcOfdX0qlPSw4iFM9Iw1e6bhmav7N2OCfauI6uCFQEpKfTc5Jm-wA',
      },
    }
    const cred2 =
      'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE2Mzc2ODAzMTcsImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgwMmY2NDk1NWRkMDVkZGU1NTkxMGYzNzllYzU3ODVlZWUwOGJiZTZlNTBkZGFlNmJhY2UwNTk2ZmQ4ZDQ2MDE4ZjcifQ.ujM4zNm8h5-Cg01vh4ka_7NmdwYl8HAjO90XjxYYwSa0-4rqzM5ndt-OE6vS6y0gPwhwlQWHmDxg4X7OTzCUoQ'
    const cred2Expanded = {
      credentialSubject: { you: 'Rock', id: 'did:web:example.com' },
      issuer: { id: 'did:ethr:rinkeby:0x02f64955dd05dde55910f379ec5785eee08bbe6e50ddae6bace0596fd8d46018f7' },
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuanceDate: '2021-11-23T15:11:57.000Z',
      proof: {
        type: 'JwtProof2020',
        jwt: 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE2Mzc2ODAzMTcsImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgwMmY2NDk1NWRkMDVkZGU1NTkxMGYzNzllYzU3ODVlZWUwOGJiZTZlNTBkZGFlNmJhY2UwNTk2ZmQ4ZDQ2MDE4ZjcifQ.ujM4zNm8h5-Cg01vh4ka_7NmdwYl8HAjO90XjxYYwSa0-4rqzM5ndt-OE6vS6y0gPwhwlQWHmDxg4X7OTzCUoQ',
      },
    }

    const presentation1 = {
      holder: 'did:ethr:0x0301240a4851f45b568809baf35921f8d78ca966738a1a0a69e693fbbd232ff080',
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [cred1, cred2],
      proof: {
        type: 'EcdsaSecp256k1RecoverySignature2020',
        created: '2021-11-23T15:09:55Z',
        verificationMethod:
          'did:ethr:0x0301240a4851f45b568809baf35921f8d78ca966738a1a0a69e693fbbd232ff080#controller',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..t34HTHSqdK0YLx_BW8VTKR6ON7QXdJbyhlPZmKH2HiOnmk0W05SuslwSPOU9NjjbtGU-IMvUU2pJVyzN6Pm2dQE',
      },
    }

    const presentation1Expanded = {
      holder: 'did:ethr:0x0301240a4851f45b568809baf35921f8d78ca966738a1a0a69e693fbbd232ff080',
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [cred1, cred2Expanded],
      proof: {
        type: 'EcdsaSecp256k1RecoverySignature2020',
        created: '2021-11-23T15:09:55Z',
        verificationMethod:
          'did:ethr:0x0301240a4851f45b568809baf35921f8d78ca966738a1a0a69e693fbbd232ff080#controller',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..t34HTHSqdK0YLx_BW8VTKR6ON7QXdJbyhlPZmKH2HiOnmk0W05SuslwSPOU9NjjbtGU-IMvUU2pJVyzN6Pm2dQE',
      },
    }

    const presentation2 =
      'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vZXhhbXBsZS5jb20vMS8yLzMiXSwidHlwZSI6WyJWZXJpZmlhYmxlUHJlc2VudGF0aW9uIiwiQ3VzdG9tIl0sInZlcmlmaWFibGVDcmVkZW50aWFsIjpbImV5SmhiR2NpT2lKRlV6STFOa3NpTENKMGVYQWlPaUpLVjFRaWZRLmV5SjJZeUk2ZXlKQVkyOXVkR1Y0ZENJNld5Sm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OTJNU0pkTENKMGVYQmxJanBiSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lsMHNJbU55WldSbGJuUnBZV3hUZFdKcVpXTjBJanA3SW5sdmRTSTZJbEp2WTJzaWZYMHNJbk4xWWlJNkltUnBaRHAzWldJNlpYaGhiWEJzWlM1amIyMGlMQ0p1WW1ZaU9qRTJNemMyT0RBek1UY3NJbWx6Y3lJNkltUnBaRHBsZEdoeU9uSnBibXRsWW5rNk1IZ3dNbVkyTkRrMU5XUmtNRFZrWkdVMU5Ua3hNR1l6TnpsbFl6VTNPRFZsWldVd09HSmlaVFpsTlRCa1pHRmxObUpoWTJVd05UazJabVE0WkRRMk1ERTRaamNpZlEudWpNNHpObThoNS1DZzAxdmg0a2FfN05tZHdZbDhIQWpPOTBYanhZWXdTYTAtNHJxek01bmR0LU9FNnZTNnkwZ1B3aHdsUVdIbUR4ZzRYN09UekNVb1EiXX0sIm5iZiI6MTYzNzY4MDMxNywiaXNzIjoiZGlkOmV0aHI6cmlua2VieToweDAyZjY0OTU1ZGQwNWRkZTU1OTEwZjM3OWVjNTc4NWVlZTA4YmJlNmU1MGRkYWU2YmFjZTA1OTZmZDhkNDYwMThmNyIsImF1ZCI6W119.hlVtPgzHZhLXQSIU3_RTpabN30t-QJL2-KqELI6G0Dkk8_gTyQbJVIZX3OsaJUV4K99-MPL_oyMXzBXWba_iBQ'

    const presentation2Expanded = {
      verifiableCredential: [
        {
          credentialSubject: { you: 'Rock', id: 'did:web:example.com' },
          issuer: {
            id: 'did:ethr:rinkeby:0x02f64955dd05dde55910f379ec5785eee08bbe6e50ddae6bace0596fd8d46018f7',
          },
          type: ['VerifiableCredential'],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          issuanceDate: '2021-11-23T15:11:57.000Z',
          proof: {
            type: 'JwtProof2020',
            jwt: 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE2Mzc2ODAzMTcsImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgwMmY2NDk1NWRkMDVkZGU1NTkxMGYzNzllYzU3ODVlZWUwOGJiZTZlNTBkZGFlNmJhY2UwNTk2ZmQ4ZDQ2MDE4ZjcifQ.ujM4zNm8h5-Cg01vh4ka_7NmdwYl8HAjO90XjxYYwSa0-4rqzM5ndt-OE6vS6y0gPwhwlQWHmDxg4X7OTzCUoQ',
          },
        },
      ],
      holder: 'did:ethr:rinkeby:0x02f64955dd05dde55910f379ec5785eee08bbe6e50ddae6bace0596fd8d46018f7',
      verifier: [],
      type: ['VerifiablePresentation', 'Custom'],
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
      issuanceDate: '2021-11-23T15:11:57.000Z',
      proof: {
        type: 'JwtProof2020',
        jwt: 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vZXhhbXBsZS5jb20vMS8yLzMiXSwidHlwZSI6WyJWZXJpZmlhYmxlUHJlc2VudGF0aW9uIiwiQ3VzdG9tIl0sInZlcmlmaWFibGVDcmVkZW50aWFsIjpbImV5SmhiR2NpT2lKRlV6STFOa3NpTENKMGVYQWlPaUpLVjFRaWZRLmV5SjJZeUk2ZXlKQVkyOXVkR1Y0ZENJNld5Sm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OTJNU0pkTENKMGVYQmxJanBiSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lsMHNJbU55WldSbGJuUnBZV3hUZFdKcVpXTjBJanA3SW5sdmRTSTZJbEp2WTJzaWZYMHNJbk4xWWlJNkltUnBaRHAzWldJNlpYaGhiWEJzWlM1amIyMGlMQ0p1WW1ZaU9qRTJNemMyT0RBek1UY3NJbWx6Y3lJNkltUnBaRHBsZEdoeU9uSnBibXRsWW5rNk1IZ3dNbVkyTkRrMU5XUmtNRFZrWkdVMU5Ua3hNR1l6TnpsbFl6VTNPRFZsWldVd09HSmlaVFpsTlRCa1pHRmxObUpoWTJVd05UazJabVE0WkRRMk1ERTRaamNpZlEudWpNNHpObThoNS1DZzAxdmg0a2FfN05tZHdZbDhIQWpPOTBYanhZWXdTYTAtNHJxek01bmR0LU9FNnZTNnkwZ1B3aHdsUVdIbUR4ZzRYN09UekNVb1EiXX0sIm5iZiI6MTYzNzY4MDMxNywiaXNzIjoiZGlkOmV0aHI6cmlua2VieToweDAyZjY0OTU1ZGQwNWRkZTU1OTEwZjM3OWVjNTc4NWVlZTA4YmJlNmU1MGRkYWU2YmFjZTA1OTZmZDhkNDYwMThmNyIsImF1ZCI6W119.hlVtPgzHZhLXQSIU3_RTpabN30t-QJL2-KqELI6G0Dkk8_gTyQbJVIZX3OsaJUV4K99-MPL_oyMXzBXWba_iBQ',
      },
    }
    expect(decodePresentationToObject(presentation1)).toEqual(presentation1Expanded)
    expect(decodePresentationToObject(presentation1Expanded)).toEqual(presentation1Expanded)
    expect(decodePresentationToObject(presentation2)).toEqual(presentation2Expanded)
    expect(decodePresentationToObject(presentation2Expanded)).toEqual(presentation2Expanded)
  })

  it('computeEntryHash for JWT', () => {
    const jwt =
      'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE2Mzc2ODAzMTcsImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgwMmY2NDk1NWRkMDVkZGU1NTkxMGYzNzllYzU3ODVlZWUwOGJiZTZlNTBkZGFlNmJhY2UwNTk2ZmQ4ZDQ2MDE4ZjcifQ.ujM4zNm8h5-Cg01vh4ka_7NmdwYl8HAjO90XjxYYwSa0-4rqzM5ndt-OE6vS6y0gPwhwlQWHmDxg4X7OTzCUoQ'
    const expandedCred = {
      credentialSubject: { you: 'Rock', id: 'did:web:example.com' },
      issuer: { id: 'did:ethr:rinkeby:0x02f64955dd05dde55910f379ec5785eee08bbe6e50ddae6bace0596fd8d46018f7' },
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuanceDate: '2021-11-23T15:11:57.000Z',
      proof: {
        type: 'JwtProof2020',
        jwt,
      },
    }
    const serializedCred = `{"credentialSubject":{"you":"Rock","id":"did:web:example.com"},"issuer":{"id":"did:ethr:rinkeby:0x02f64955dd05dde55910f379ec5785eee08bbe6e50ddae6bace0596fd8d46018f7"},"type":["VerifiableCredential"],"@context":["https://www.w3.org/2018/credentials/v1"],"issuanceDate":"2021-11-23T15:11:57.000Z","proof":{"type":"JwtProof2020","jwt":"${jwt}"}}`
    expect(computeEntryHash(expandedCred)).toEqual(computeEntryHash(serializedCred))
    expect(computeEntryHash(jwt)).toEqual(computeEntryHash(serializedCred))
    expect(computeEntryHash(serializedCred)).toEqual(
      'QmYBWeZCoB1zbJwGou1svfgrq9muVQyy7uzokMfdeSEoHH',
    )
  })

  it('computeEntryHash for LD', () => {
    const expandedCred = {
      issuer: { id: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn' },
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
      type: ['VerifiableCredential', 'Profile'],
      issuanceDate: '2021-11-23T15:06:12.820Z',
      credentialSubject: {
        id: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn',
        name: 'Martin, the great',
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2021-11-23T15:06:12Z',
        verificationMethod:
          'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn#z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..wKMmMZNdIgL_19HYJgpRL9SeKVzYT85S-ZyVdF3IMiaiL8nhX8i48D82TQtuQlTT960h_TOQ18fQFula6QxADA',
      },
    }
    const serializedCred =
      '{"issuer":{"id":"did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn"},"@context":["https://www.w3.org/2018/credentials/v1","https://veramo.io/contexts/profile/v1"],"type":["VerifiableCredential","Profile"],"issuanceDate":"2021-11-23T15:06:12.820Z","credentialSubject":{"id":"did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn","name":"Martin, the great"},"proof":{"type":"Ed25519Signature2018","created":"2021-11-23T15:06:12Z","verificationMethod":"did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn#z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn","proofPurpose":"assertionMethod","jws":"eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..wKMmMZNdIgL_19HYJgpRL9SeKVzYT85S-ZyVdF3IMiaiL8nhX8i48D82TQtuQlTT960h_TOQ18fQFula6QxADA"}}'
    expect(computeEntryHash(expandedCred)).toEqual(computeEntryHash(serializedCred))
    expect(computeEntryHash(serializedCred)).toEqual(
      'QmYeBhqpqiFUcsTS1qz7tkuVCJq8Z4VrrSJsjJc4Q7k9ig',
    )
  })

  it('extractIssuer', () => {
    const ldCred1 = {
      issuer: { id: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn' },
      proof: {
        type: 'fake',
      },
    }
    const ldCred2 = {
      issuer: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn',
      proof: {
        type: 'fake',
      },
    }
    const ldCred3 = {
      issuer: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn?versionTime=2023-01-01T00:00:00Z',
      proof: {
        type: 'fake',
      },
    }
    const ldPres = {
      holder: 'did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn',
      proof: {
        type: 'fake',
      },
    }
    const jwt =
      'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE2Mzc2ODAzMTcsImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgwMmY2NDk1NWRkMDVkZGU1NTkxMGYzNzllYzU3ODVlZWUwOGJiZTZlNTBkZGFlNmJhY2UwNTk2ZmQ4ZDQ2MDE4ZjcifQ.ujM4zNm8h5-Cg01vh4ka_7NmdwYl8HAjO90XjxYYwSa0-4rqzM5ndt-OE6vS6y0gPwhwlQWHmDxg4X7OTzCUoQ'
    expect(extractIssuer(ldCred1)).toEqual('did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn')
    expect(extractIssuer(ldCred2)).toEqual('did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn')
    expect(extractIssuer(ldCred3)).toEqual('did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn?versionTime=2023-01-01T00:00:00Z')
    expect(extractIssuer(ldCred3, { removeParameters: true })).toEqual('did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn')
    expect(extractIssuer(ldPres)).toEqual('did:key:z6MkvGFkoFarw7pXRBkKqZKwDcc2L3U4AZC1RtBiceicUHqn')
    expect(extractIssuer(jwt)).toEqual(
      'did:ethr:rinkeby:0x02f64955dd05dde55910f379ec5785eee08bbe6e50ddae6bace0596fd8d46018f7',
    )
    expect(extractIssuer('')).toEqual('')
    expect(extractIssuer('header.payload.signature')).toEqual('')
    expect(extractIssuer({} as any)).toEqual('')
    expect(extractIssuer(null)).toEqual('')
    expect(extractIssuer(undefined)).toEqual('')
  })
})
