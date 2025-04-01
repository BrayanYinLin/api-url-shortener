import { describe, expect, it } from 'vitest'
import { getExpirationWithTimezone } from '../../lib/utils'

describe('Utils tests', () => {
  it('should return datetime with timezone', () => {
    const timestampWithTimezone = getExpirationWithTimezone(
      new Date(Date.now()).toISOString()
    )

    const timestampRegex =
      /\d{4}(-)\d{2}(-)\d{2}T\d{2}(:)\d{2}(:)\d{2}.\d{2,3}-\d{2}(:)\d{2}/

    expect(timestampRegex.test(timestampWithTimezone!)).toBeTruthy()
  })
})
