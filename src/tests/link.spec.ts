import { describe, expect, it } from 'vitest'
import { link } from '../models/link.model'

describe('Links tests', () => {
  //  Passed
  it.skip('should create a link', async () => {
    const response = await fetch('http://localhost:5373/api/link/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        long: 'https://music.youtube.com/watch?v=gE2tMp-ou7s&si=sE5bQWrePacGMLDA',
        short: 'brujitas-salemsosas'
      })
    })

    const parsed = await response.json()
    console.log(parsed)
    expect(response.ok).toBeTruthy()
    expect(() => link.parse(parsed)).not.toThrow()
  })

  //  Passed
  it.skip('should update a link', async () => {
    const response = await fetch(
      'http://localhost:5373/api/link/e72ff0d0-e7b0-4faa-bb81-8a164609cb21',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          long: 'https://music.youtube.com/watch?v=gE2tMp-ou7s&si=sE5bQWrePacGMLDA',
          short: 'brujas-salem'
        })
      }
    )

    const parsed = await response.json()
    console.log(parsed)
    expect(response.ok).toBeTruthy()
    expect(() => link.parse(parsed)).not.toThrow()
  })
})
